import {createServer} from "http";
import express from "express";
import {Server as WebSocketServer} from "ws";
import path from "path";
import {MulterConfig} from "./config/config.multer";
import {MediaController} from "./media/media.controller";
import {YWebSocketUtils} from "./utils/yWebSocketUtils";
import cors from "cors";

const PORT = parseInt(process.env.PORT || "3000");
const MEDIA_PATH = path.join(__dirname, "../../data/media");
const PERSISTENCE_PATH = path.join(__dirname, "../../data/persistence");
const FRONTEND_PUBLIC_PATH = path.join(__dirname, "../../frontend/public");

(async () => {
    try {
        const app = express();
        app.use(express.json({limit: "100mb"}));

        // Logging
        app.use((req, _res, next) => {
            console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
            next();
        });

        // Allow any origin or customize
        app.use(cors({origin: "*", credentials: true}));

        app.use(express.static(FRONTEND_PUBLIC_PATH));

        // Register media controller
        const multerConfig = new MulterConfig(MEDIA_PATH);
        const mediaController = new MediaController(MEDIA_PATH, multerConfig);
        app.use("/", mediaController.router);

        // Create shared HTTP server
        const server = createServer(app);

        // Create WebSocket server on same HTTP server
        const wss = new WebSocketServer({server});
        const yWebSocketUtils = new YWebSocketUtils(PERSISTENCE_PATH);
        wss.on("connection", (conn, req) => yWebSocketUtils.setupWSConnection(conn as any, req));

        app.get("*", (_req, res) => {
            res.sendFile(path.join(FRONTEND_PUBLIC_PATH, "index.html"));
        });

        // Start server
        server.listen(PORT, () => {
            console.log(`Unified server running at http://localhost:${PORT}`);
            console.log(`Media path: ${MEDIA_PATH}`);
            console.log(`Yjs path: ${PERSISTENCE_PATH}`);
        });

    } catch (err: any) {
        console.error("Failed to start unified server:", err.message);
        process.exit(1);
    }
})();
