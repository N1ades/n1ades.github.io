import { WebSocketServer, type RawData} from 'ws';

export class WebsocketServerHeartbeat extends WebSocketServer {

    interval: any;

    constructor(options: any) {
        super(options);
        this.on('connection', this.heartbeatConnection);


        this.on('close', this.clearHeartbeatInterval);

        this.startHeartbeatInterval();
    }

    clearHeartbeatInterval = () => {
        clearInterval(this.interval);
    }

    heartbeatConnection = (ws: any) => {
        ws.isAlive = true;

        ws.on('pong', () => {
            // console.log('Pong received from client');
            ws.isAlive = true;
        });
        ws.on('error', console.error);
        ws.onceMessage = ({ timeoutDelay }: { timeoutDelay: number }) => {
            return new Promise((resolve, reject) => {
                const message = (data: RawData, isBinary: boolean) => {
                    try {
                        clearTimeout(timeout);
                        resolve(data);
                    }
                    catch (error) {
                        reject(error);
                    }
                    finally {
                        ws.off('close', reject);
                    }
                }

                let timeout = setTimeout(() => {
                    reject(new Error('Timeout waiting for message'));
                    ws.close();
                    ws.off('close', reject);
                    ws.off('message', message);
                }, timeoutDelay);

                ws.once('close', reject);
                ws.once('message', message);
            })
        }
    }

    startHeartbeatInterval = () => {
        this.interval = setInterval(() => {
            this.clients.forEach((ws: any) => {
                if (ws.isAlive === false) {
                    console.log('Terminating client due to inactivity');
                    ws.terminate();
                    return
                }
                ws.isAlive = false;
                ws.send('');
                ws.ping();
                // console.log('Ping sent to client');

            });
        }, 3000);
    }

}