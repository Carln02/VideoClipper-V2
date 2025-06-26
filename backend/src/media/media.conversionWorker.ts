import {parentPort, workerData, isMainThread} from "worker_threads";
import {spawn} from "child_process";
import path from "path";
import fs from "fs";

if (!isMainThread) {
    const {inputPath} = workerData;
    console.log(inputPath);
    const outputPath = path.format({
        ...path.parse(inputPath),
        base: undefined, // Clear base so `name + ext` is used
        ext: ".mp4"
    });
    console.log(outputPath);

    const ffmpeg = spawn("ffmpeg", [
        "-i", inputPath,
        "-c:v", "libx264",
        "-preset", "fast",
        "-crf", "23",
        "-c:a", "aac",
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