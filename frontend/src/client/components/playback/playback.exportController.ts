import {TurboController} from "turbodombuilder";
import {Playback} from "./playback";
import {PlaybackView} from "./playback.view";
import {PlaybackModel} from "./playback.model";

export class PlaybackExportController extends TurboController<Playback, PlaybackView, PlaybackModel> {
    protected setupChangedCallbacks() {
        super.setupChangedCallbacks();
        this.emitter.add("export", () => this.exportSequenceToVideo());
    }

    private pickMimeType(): string {
        for (const type of [
            "video/mp4;codecs=h264,aac",
            "video/mp4;codecs=avc1.42E01E,mp4a.40.2",
            "video/webm;codecs=vp9,opus",
            "video/webm;codecs=vp8,opus",
            "video/webm"
        ]) {
            if (window.MediaRecorder?.isTypeSupported?.(type)) return type;
        }
        return "";
    }

    public async exportSequenceToVideo(fps: number = 30, filename: string = "sequence", paddingMs: number = 250): Promise<void> {
        this.element.renderer.renderOnCanvas = true;

        const stream = this.element.renderer.canvas.captureStream(fps);
        const mimeType = this.pickMimeType();
        const chunks: Blob[] = [];
        let rec: MediaRecorder;

        try {
            rec = new MediaRecorder(stream, mimeType ?
                {mimeType, videoBitsPerSecond: 2_500_000} : {videoBitsPerSecond: 2_500_000});
        } catch (e) {
            rec = new MediaRecorder(stream);
        }

        rec.ondataavailable = (e) => {
            if (!e.data || !e.data.size) return;
            if (chunks.length === 0) console.log("first chunk type:", e.data.type || "(empty)");
            chunks.push(e.data);
        };
        rec.onerror = (e) => console.error("MediaRecorder error:", e);
        const stopped = new Promise<void>((resolve) => rec.onstop = () => resolve());

        rec.start(100);
        await this.element.timeline.play(0);
        await new Promise((resolve) => setTimeout(resolve, paddingMs));

        if (rec.state !== "inactive") rec.stop();
        await stopped;
        this.element.renderer.renderOnCanvas = false;

        const type = chunks[0]?.type || rec.mimeType || mimeType || "video/webm";
        const blob = new Blob(chunks, { type });
        const url = URL.createObjectURL(blob);
        const ext = type.startsWith("video/mp4") ? "mp4" : "webm";

        // 7) download
        const a = document.createElement("a");
        a.href = url;
        a.download = `${filename}.${ext}`;
        this.element.addChild(a);
    }
}
