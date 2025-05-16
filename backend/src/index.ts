import {createServer} from "http";
import express from "express";
import {Server as WebSocketServer} from "ws";
import path from "path";
import cors from "cors";
import cookieParser from "cookie-parser";
import {OAuth2Client} from "google-auth-library";
import {YWebSocketUtils} from "./utils/yWebSocketUtils";
import {MediaController} from "./media/media.controller";
import {MulterConfig} from "./config/config.multer";

const PORT = parseInt(process.env.PORT || "3000");
const MEDIA_PATH = path.join(__dirname, "../../data/media");
const PERSISTENCE_PATH = path.join(__dirname, "../../data/persistence");
const FRONTEND_PUBLIC_PATH = path.join(__dirname, "../../frontend/public");
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const client = new OAuth2Client(CLIENT_ID);

const sessions = new Map(); // sessionId -> user data

(async () => {
    try {
        const app = express();
        app.use(express.json({limit: "100mb"}));
        app.use(cors({origin: "*", credentials: true}));
        app.use(cookieParser());
        app.use(express.static(FRONTEND_PUBLIC_PATH));

        app.use((req, res, next) => {
            res.header("Access-Control-Allow-Origin", "http://localhost:3000");
            res.header("Access-Control-Allow-Credentials", "true");
            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
            next();
        });

        // Media controller
        const multerConfig = new MulterConfig(MEDIA_PATH);
        const mediaController = new MediaController(MEDIA_PATH, multerConfig);
        app.use("/", mediaController.router);

        app.get("/api/auth/me", (req, res) => {
            const sessionId = req.cookies.session;
            const user = sessions.get(sessionId);
            if (user) res.json({loggedIn: true, user});
            else res.status(401).json({loggedIn: false});
        });

        // Auth endpoint
        app.post("/api/auth/google", async (req, res) => {
            const idToken = req.body.idToken;
            try {
                const ticket = await client.verifyIdToken({
                    idToken,
                    audience: CLIENT_ID,
                });
                const payload = ticket.getPayload();
                const sessionId = crypto.randomUUID();
                sessions.set(sessionId, payload);

                res.cookie("session", sessionId, {
                    httpOnly: true,
                    maxAge: 1000 * 60 * 60 * 24 * 30,
                    sameSite: "lax",
                });

                res.sendStatus(200);
            } catch (err) {
                console.error("Invalid Google ID token", err);
                res.sendStatus(401);
            }
        });

        app.post("/api/auth/logout", (req, res) => {
            const sessionId = req.cookies.session;
            sessions.delete(sessionId);
            res.clearCookie("session");
            res.sendStatus(200);
        });

        // Create HTTP and WebSocket servers
        const server = createServer(app);
        const wss = new WebSocketServer({noServer: true});
        const yWebSocketUtils = new YWebSocketUtils(PERSISTENCE_PATH);

        server.on("upgrade", (req, socket, head) => {
            const cookies = Object.fromEntries(
                (req.headers.cookie || "")
                    .split(";")
                    .map(c => c.trim().split("=").map(decodeURIComponent))
            );
            const sessionId = cookies.session;
            if (!sessionId || !sessions.has(sessionId)) {
                socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
                socket.destroy();
                return;
            }

            req.user = sessions.get(sessionId); // Attach user info to request
            wss.handleUpgrade(req, socket, head, (ws) => {
                wss.emit("connection", ws, req);
            });
        });

        wss.on("connection", (conn, req) => yWebSocketUtils.setupWSConnection(conn as any, req));

        app.get("*", (_req, res) => {
            res.sendFile(path.join(FRONTEND_PUBLIC_PATH, "index.html"));
        });

        server.listen(PORT, () => {
            console.log(`Server running at http://localhost:${PORT}`);
        });

    } catch (err: any) {
        console.error("Failed to start server:", err.message);
        process.exit(1);
    }
})();
