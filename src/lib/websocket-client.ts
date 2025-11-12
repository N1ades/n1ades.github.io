import { EventListener } from "./event-listener.ts";



/**
 * EventTypes represents the possible events that can be emitted by the WebsocketManager.
 * - 'open': Triggered when the WebSocket connection is successfully opened.
 * - 'message': Triggered when a message is received from the WebSocket.
 * - 'error': Triggered when an error occurs in the WebSocket.
 * - 'close': Triggered when the WebSocket connection is closed.
 * - 'reconnect': Triggered when the WebSocket attempts to reconnect.
 */
type EventTypes = 'reconnect' | 'open' | 'message' | 'error' | 'close';

export class WebsocketClient extends EventListener<EventTypes> {
    open: boolean;
    url: any;
    ws?: WebSocket;

    constructor(url: string | URL) {
        super();
        this.open = true;
        this.url = url;
        this.connect();
    }

    reconnectTimeout = () => setTimeout(() => {
        this._close();
        // this._callEventListeners("reconnect");
        console.log('reconnecting websocket');
        this.connect();
    }, 5000 + 2000)

    pingTimeout = this.reconnectTimeout();

    heartbeat = () => {
        clearTimeout(this.pingTimeout);
        this.pingTimeout = this.reconnectTimeout();
    }

    connect = () => {
        console.log('create WebSocket');

        const ws = new WebSocket(this.url);
        this.heartbeat();

        ws.addEventListener("error", (event) => {
            console.error("WebSocket error observed:", event);
            this._callEventListeners("error", event);
        });

        ws.addEventListener("open", (event) => {
            console.log("open");
            this.ws = ws;
            this.heartbeat();
            this._callEventListeners("open", event);
        });

        ws.addEventListener("message", (event) => {
            
            if (typeof event.data !== 'string') {
                console.error('unsupported messageType');
                return;
            }

            if (event.data.length === 0) {
                this.heartbeat();
                return;
            }
            console.log("message", event.data);

            this._callEventListeners("message", event);
        });

        ws.addEventListener("close", (event) => {
            console.log('close');
            this._close();
            this._callEventListeners("close", event);
            if (this.open) {
                this.heartbeat();
                // this._callEventListeners("reconnect", event);
                console.log('wait for reconnect');
            }
        });
    }



    send = (data: Parameters<WebSocket['send']>[0]) => {
        if (!this.ws) {
            console.error('send: WebSocket not connected');
            return
        }

        this.ws.send(data);
    }

    destroy = () => {
        console.log('WebSocketManager destroy');
        this.open = false;
        clearTimeout(this.pingTimeout);
        this._close();
    }

    _close = () => {
        const ws = this.ws;
        delete this.ws;
        ws?.OPEN && ws.close();
    }


    onceMessage = ({ timeoutDelay }: { timeoutDelay: number }) => {
        return new Promise<MessageEvent>((resolve, reject) => {
            const message = (event: MessageEvent<any>) => {
                try {
                    clearTimeout(timeout);
                    resolve(event);
                }
                catch (error) {
                    reject(error);
                }
                finally {
                    this.off('close', reject);
                }
            }

            let timeout = setTimeout(() => {
                reject(new Error('Timeout waiting for message'));
                this.destroy();
                this.off('close', reject);
                this.off('message', message);
            }, timeoutDelay);

            this.once('close', reject);
            this.once('message', message);
        })
    }
}
