import {Server as WebSocketServer} from "ws";
import {IncomingMessage, Server} from "http";
import {WebSocketYUtils} from "./webSocket.yUtils";
import {App} from "../app/app";
import path from "path";
import {Request} from "express";
import {ObjectId} from "mongodb";
import {User} from "../user/user";
import {WebSocket} from "ws";

export class VcWebSocket {
    public readonly PERSISTENCE_PATH = path.resolve(process.env.PERSISTENCE_PATH || "../../data/persistence");

    public readonly wss: WebSocketServer;
    private readonly yUtils: WebSocketYUtils;

    public constructor(private readonly app: App) {
        this.wss = new WebSocketServer({ noServer: true });
        this.yUtils = new WebSocketYUtils(this.PERSISTENCE_PATH);
        this.wss.on("connection", async (ws: WebSocket, req: Request) => this.onConnection(ws, req));
    }

    protected async onConnection(ws: WebSocket, req: Request) {
        const user: User = req.user;

        if (!user?._id) {
            console.warn("No user ID found on WebSocket request");
            ws.close();
            return;
        }

        const docName = req.url?.slice(1).split("?")[0];

        if (!docName) {
            console.warn("Missing docName in URL");
            ws.close();
            return;
        }

        // if (docName.startsWith("PROJECT:")) {
        //     const projectId = new ObjectId(docName.slice("PROJECT:".length));
        //     const userCanAccess = await this.app.repositories.projectRepository.userHasAccessToProject(user._id, projectId);
        //     if (!userCanAccess) {
        //         console.warn(`User ${user._id} attempted to access unauthorized project ${projectId}`);
        //         ws.close();
        //         return;
        //     }
        // }

        console.log("SETTING UP CONNECTION NOW....")
        await this.yUtils.setupWSConnection(ws, req, {docName: docName});
    }

    public upgrade(server: Server) {
        server.on("upgrade", (req: IncomingMessage, socket, head) => {
            const cookies = Object.fromEntries(
                (req.headers.cookie || "")
                    .split(";")
                    .map(c => c.trim().split("=").map(decodeURIComponent))
            );
            const sessionId = cookies.session;
            if (!sessionId || !this.app.sessions.has(sessionId)) {
                socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
                socket.destroy();
                return;
            }

            (req as any).user = this.app.sessions.get(sessionId);
            this.wss.handleUpgrade(req, socket, head, ws => {
                this.wss.emit("connection", ws, req);
            });
        });
    }
}
