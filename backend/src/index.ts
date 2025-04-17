import {DataServer} from "./servers/dataServer";
import {YJSServer} from "./servers/yjsServer";
import path from "path";

const MEDIA_PORT = parseInt(process.env.PORT || "3000");
const MEDIA_PATH = path.join(__dirname, "../../data/media");

const PERSISTENCE_PORT = parseInt(process.env.PORT || "3100");
const PERSISTENCE_PATH = path.join(__dirname, "../../data/persistence");

(async () => {
    try {
        const mediaServer = new DataServer(MEDIA_PORT, MEDIA_PATH);
        await mediaServer.init();
        mediaServer.start();

        const yjsServer = new YJSServer(PERSISTENCE_PORT, PERSISTENCE_PATH);
        yjsServer.start();
    } catch (err: any) {
        console.error("Failed to start server:", err.message);
        process.exit(1);
    }
})();