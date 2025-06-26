import express from "express";
import cors from "cors";
import path from "path";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import {AppRepositories} from "./app.repositories";
import {MulterUtil} from "../utils/multerUtil";
import {appRoutes} from "./app.routes";
import {Server} from "http";
import {createServer} from "http";
import {VcWebSocket} from "../webSocket/webSocket";
import {authenticate, checkOrigin} from "./app.middlewares";
import "./app.types";

dotenv.config();

export class App {
    public readonly FRONTEND_PUBLIC_PATH = path.resolve(process.env.FRONTEND_PUBLIC_PATH || "../../frontend/public");
    public readonly MEDIA_PATH = path.resolve(process.env.MEDIA_PATH || "../../data/media");
    public readonly PORT = parseInt(process.env.PORT || "3000");

    private readonly allowedOrigins = [
        "http://localhost:9000",
        "http://localhost:3000"
    ];

    public readonly app: express.Application;

    private _server?: Server;
    private _webSocket?: VcWebSocket;

    public readonly multerUtil: MulterUtil;
    public readonly repositories: AppRepositories;

    public readonly sessions = new Map<string, any>();

    public constructor() {
        this.app = express();
        this.multerUtil = new MulterUtil(this.MEDIA_PATH);
        this.repositories = new AppRepositories(this.MEDIA_PATH);
        this.setup();
    }

    private setup() {
        this.app.use(express.json({limit: "100mb"}));
        this.app.use(cors({
            origin: (origin, callback) => {
                if (!origin) return callback(null, true);
                if (this.allowedOrigins.includes(origin)) return callback(null, true);
                return callback(new Error("Not allowed by CORS"));
            },
            credentials: true
        }));

        this.app.use(cookieParser());
        this.app.use(express.static(this.FRONTEND_PUBLIC_PATH));
        this.app.use(authenticate(this.sessions));
        this.app.use(checkOrigin(this.allowedOrigins));
    }

    public async initialize() {
        await this.repositories.initialize();
        this.app.use("/", appRoutes(this));
    }

    public createServer() {
        this._server = createServer(this.app);
        this._webSocket = new VcWebSocket(this);

        this.webSocket.upgrade(this.server);
        this.server.listen(this.PORT, () => {
            console.log(`✅ Server running at http://localhost:${this.PORT}`);
        });
    }

    public get server(): Server {
        if (!this._server) throw new Error("Server not yet initialized.");
        return this._server;
    }

    public get webSocket(): VcWebSocket {
        if (!this._webSocket) throw new Error("WebSocket not initialized.");
        return this._webSocket;
    }
}