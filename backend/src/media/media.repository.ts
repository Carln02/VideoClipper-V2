import fs from "fs";
import path from "path";
import {FileInfo} from "./media.types";
import {AppRepositories} from "../app/app.repositories";
import "./media.conversionWorker";
import {Worker} from "worker_threads";

export class MediaRepository {
    public constructor(private mediaStoragePath: string, private repos: AppRepositories) {}

    public getFileInfo(id: string): Promise<FileInfo> {
        return new Promise((resolve, reject) => {
            fs.readdir(this.mediaStoragePath, (err, files) => {
                if (err) return reject(new Error(`Error reading directory: ${err.message}`));

                // find file that starts with the requested id
                const matchingFile = files.find(file => file.startsWith(id));

                if (!matchingFile) return reject(new Error("File not found"));

                const filePath = path.join(this.mediaStoragePath, matchingFile);

                fs.stat(filePath, (statErr, stats) => {
                    if (statErr) return reject(new Error(`Error getting file stats: ${statErr.message}`));

                    const ext = path.extname(matchingFile).toLowerCase();
                    let contentType = "application/octet-stream";

                    if (ext === ".mp4") contentType = "video/mp4";
                    else if (ext === ".webm") contentType = "video/webm";
                    else if (ext === ".jpg" || ext === ".jpeg") contentType = "image/jpeg";
                    else if (ext === ".png") contentType = "image/png";
                    else if (ext === ".gif") contentType = "image/gif";
                    else if (ext === ".webp") contentType = "image/webp";

                    resolve({
                        filePath,
                        contentType,
                        size: stats.size
                    });
                });
            });
        });
    }

    public createReadStream(filePath: string): fs.ReadStream {
        return fs.createReadStream(filePath);
    }

    public spawnConversionWorker({id, inputPath}: { id: string, inputPath: string }) {
        return new Promise<void>((resolve, reject) => {

            const worker = new Worker(path.resolve(process.cwd(), "backend/dist/media/media.conversionWorker.js"), {
                workerData: {inputPath}
            });

            worker.on("message", (msg) => {
                if (msg.type === "log") {
                    console.log("[Worker]", msg.message);
                } else if (msg.type === "error") {
                    console.error("[Worker Error]", msg.message);
                    reject(new Error(msg.message));
                } else if (msg.type === "done") {
                    console.log("[Worker] Conversion finished");
                    resolve();
                }
            });

            worker.on("error", (err) => {
                console.error("[Worker Internal Error]", err);
                reject(err);
            });

            worker.on("exit", (code) => {
                if (code !== 0) {
                    console.error(`[Worker] Exited with code ${code}`);
                    reject(new Error(`Worker exited with code ${code}`));
                }
            });
        });
    }
}
