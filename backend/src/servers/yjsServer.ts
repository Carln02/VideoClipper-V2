import * as http from "http";
import WebSocket from "ws";
import {YWebSocketUtils} from "../utils/yWebSocketUtils";

export class YJSServer {
    private yWebSocketUtils: YWebSocketUtils;

    private server: http.Server;
    private wss: WebSocket.Server;
    private readonly port: number;
    private readonly storagePath: string;

    public constructor(port: number, storagePath: string) {
        this.port = port;
        this.storagePath = storagePath;
        this.yWebSocketUtils = new YWebSocketUtils(this.storagePath);

        this.server = http.createServer((req, res) => {
            res.writeHead(200);
            res.end("Yjs WebSocket Server is running.");
        });

        this.wss = new WebSocket.Server({server: this.server});
        this.wss.on("connection", (conn, req) => this.yWebSocketUtils.setupWSConnection(conn as any, req));
    }

    public start() {
        this.server.listen(this.port, () => console.log(`Yjs WebSocket Server listening on ws://localhost:${this.port}`));
    }
}

