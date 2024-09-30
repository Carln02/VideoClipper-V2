import {FFmpeg} from "@ffmpeg/ffmpeg";

export async function createFfmpeg() {
    const ffmpeg = new FFmpeg();
    ffmpeg.on("log", ({message}) => console.log(message));
    await ffmpeg.load();
    return ffmpeg;
}