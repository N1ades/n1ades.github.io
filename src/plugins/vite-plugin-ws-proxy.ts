import pkg from 'http-proxy';
const { createProxyServer } = pkg;
import http from 'http';
import { Connect, ViteDevServer } from 'vite';

interface WebsocketProxyOptions {
    target: string;
    wsPathFilter?: (url: string) => boolean;
}

export const websocketProxyPlugin = ({ target, wsPathFilter = (_url: string) => true }: WebsocketProxyOptions) => {
    const proxy = createProxyServer({
        target,
        ws: true,
        changeOrigin: true,
        secure: false, // skip if using self-signed certs
    });

    proxy.on('error', (err: Error, req: http.IncomingMessage, socket: any) => {
        console.error('[WS Proxy Error]', err.message);
        if (socket && socket.writable) {
            socket.end('HTTP/1.1 500 WebSocket Proxy Error\r\n\r\n');
        }
    });

    return {
        name: 'vite-plugin-ws-proxy',

        configureServer(server: ViteDevServer) {
            // Handle HTTP requests - proxy all requests and only use default if 404
            server.middlewares.use((req: Connect.IncomingMessage, res: http.ServerResponse, next: Connect.NextFunction) => {
                const proxyOptions = {
                    target,
                    selfHandleResponse: true
                };

                const listener = function(proxyRes: http.IncomingMessage, req: http.IncomingMessage, res: http.ServerResponse) {
                    // If the response is 404, let Vite handle it by default
                    if (proxyRes.statusCode === 404) {
                        proxyRes.resume(); // Drain the stream
                        proxy.removeListener('proxyRes', listener);
                        return next();
                    }

                    // Otherwise, forward the response
                    res.statusCode = proxyRes.statusCode || 200;
                    Object.keys(proxyRes.headers).forEach(key => {
                        const value = proxyRes.headers[key];
                        if (value !== undefined) {
                            res.setHeader(key, value);
                        }
                    });

                    proxyRes.pipe(res);
                    proxyRes.on('end', () => {
                        proxy.removeListener('proxyRes', listener);
                    });
                };

                proxy.once('proxyRes', listener);

                proxy.web(req, res, proxyOptions, (err: Error) => {
                    proxy.removeListener('proxyRes', listener);
                    if (res.headersSent) {
                        // If headers already sent, just log and return
                        console.error('[HTTP Proxy Error after headers sent]', err);
                        return;
                    }
                    console.error('[HTTP Proxy Error]', err);
                    next();
                });
            });

            // Handle WebSocket connections
            server.httpServer?.on('upgrade', (req: http.IncomingMessage, socket: any, head: Buffer) => {
                if (req.url && wsPathFilter(req.url)) {
                    proxy.ws(req, socket, head);
                }
            });
        },
    };
}