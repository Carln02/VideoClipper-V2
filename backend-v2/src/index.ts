// src/index.ts

import {Server} from "./server/server";

const PORT = parseInt(process.env.PORT || '3000');
const MEDIA_PATH = process.env.MEDIA_STORAGE_PATH;

(async () => {
    try {
        const server = new Server(PORT, MEDIA_PATH);
        await server.init();
        server.start();
    } catch (err: any) {
        console.error('Failed to start server:', err.message);
        process.exit(1);
    }
})();