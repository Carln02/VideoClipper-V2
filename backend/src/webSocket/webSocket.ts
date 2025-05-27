import {Server as WebSocketServer} from "ws";
import {IncomingMessage, Server} from "http";
import {WebSocketYUtils} from "./webSocket.yUtils";
import {App} from "../app/app";
import path from "path";

export class VcWebSocket {
    public readonly PERSISTENCE_PATH = path.resolve(process.env.PERSISTENCE_PATH || "../../data/persistence");

    public readonly wss: WebSocketServer;
    private readonly yUtils: WebSocketYUtils;

    public constructor(private readonly app: App) {
        this.wss = new WebSocketServer({ noServer: true });
        this.yUtils = new WebSocketYUtils(this.PERSISTENCE_PATH);

        this.wss.on("connection", (conn, req) => {
            this.yUtils.setupWSConnection(conn as any, req);
        });
    }

    public upgrade(server: Server) {
        server.on("upgrade", (req: IncomingMessage, socket, head) => {
            const cookies = Object.fromEntries(
                (req.headers.cookie || "")
                    .split(";")
                    .map(c => c.trim().split("=").map(decodeURIComponent))
            );
            const sessionId = cookies.session;
            //TODO uncomment this
            // if (!sessionId || !this.app.sessions.has(sessionId)) {
            //     socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
            //     socket.destroy();
            //     return;
            // }

            (req as any).user = this.app.sessions.get(sessionId);
            this.wss.handleUpgrade(req, socket, head, ws => {
                this.wss.emit("connection", ws, req);
            });
        });
    }
}
