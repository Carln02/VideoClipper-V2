import {parentPort, workerData, isMainThread} from "worker_threads";
import {spawn} from "child_process";
import path from "path";
import fs from "fs";

if (!isMainThread) {
    const {inputPath} = workerData;
    const outputPath = path.format({
        ...path.parse(inputPath),
        base: undefined,
        ext: ".mp4"
    });

    const ffmpeg = spawn("ffmpeg", [
        "-i", inputPath,
        "-r", "30",
        "-c:v", "libx264",
        "-pix_fmt", "yuv420p",
        "-preset", "fast",
        "-crf", "23",
        "-c:a", "aac",
        "-movflags", "+faststart",
        outputPath
    ]);

    ffmpeg.stderr.on("data", (data) => {
        parentPort?.postMessage({type: "log", message: data.toString()});
    });

    ffmpeg.on("close", async (code) => {
        if (code === 0) {
            fs.unlink(inputPath, (err) => parentPort?.postMessage({
                type: "error",
                message: `Conversion succeeded but failed to delete input: ${err?.message}`
            }));
            parentPort?.postMessage({type: "done", outputPath});
        } else {
            parentPort?.postMessage({type: "error", message: `FFmpeg exited with code ${code}`});
        }
    });

    ffmpeg.on("error", (err) => {
        parentPort?.postMessage({type: "error", message: `Failed to start FFmpeg: ${err.message}`});
    });
}