import {TurboController} from "turbodombuilder";
import {CameraModel} from "./camera.model";
import {Camera} from "./camera";
import {CameraView} from "./camera.view";
import {SyncedMedia} from "../../handlers/mediaHandler/mediaHandler.types";
import {MediaHandler} from "../../handlers/mediaHandler/mediaHandler";
import {getVideoDuration} from "../../utils/video";

export class CameraRecordingController extends TurboController<Camera, CameraView, CameraModel> {
    private negotiatedType: string = "";

    protected setupChangedCallbacks() {
        super.setupChangedCallbacks();
        this.emitter.add("stream", () => this.setupMediaRecorder());
    }

    protected get mediaHandler(): MediaHandler {
        return this.element.director.mediaHandler;
    }

    public startRecording() {
        if (!this.model.mediaRecorder || this.model.mediaRecorder.state != "inactive") {
            console.log("Unable to start recording");
            return;
        }

        this.model.recordedChunks = [];
        this.model.mediaRecorder.start(100);
        this.model.lastRecorderTimestamp = Date.now();
    }

    public stopRecording() {
        if (!this.model.mediaRecorder || this.model.mediaRecorder.state != "recording") {
            console.log("No recording in progress");
            return;
        }
        this.model.mediaRecorder.stop();
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

    protected setupMediaRecorder() {
        if (!this.model.stream) return;

        const mimeType = this.pickMimeType();
        this.negotiatedType = mimeType

        try {
            this.model.mediaRecorder = new MediaRecorder(this.model.stream, mimeType ?
                {mimeType, videoBitsPerSecond: 2_500_000} : {videoBitsPerSecond: 2_500_000});
        } catch (e) {
            this.model.mediaRecorder = new MediaRecorder(this.model.stream);
        }

        this.model.mediaRecorder.ondataavailable = (e) => e.data?.size > 0 && this.model.recordedChunks.push(e.data);

        this.model.mediaRecorder.onstop = () => this.saveMedia().catch(e => console.error(e));
        this.model.mediaRecorder.onerror = (e) => console.error("MediaRecorder error:", e);
    }

    public async saveMedia(file?: Blob) {
        if (!file) {
            if (!this.model.recordedChunks || this.model.recordedChunks.length === 0) return;

            let type = this.model.recordedChunks[0]?.type
                || this.model.mediaRecorder?.mimeType
                || this.negotiatedType
                || "video/webm";

            if (!type || type === "application/octet-stream") {
                const buf = new Uint8Array(await new Blob(this.model.recordedChunks).slice(0, 16).arrayBuffer());
                if (buf[0] === 0x1A && buf[1] === 0x45 && buf[2] === 0xDF && buf[3] === 0xA3) type = "video/webm";
                if (buf[4] === 0x66 && buf[5] === 0x74 && buf[6] === 0x79 && buf[7] === 0x70) type = "video/mp4";
            }

            file = new Blob(this.model.recordedChunks, {type});
            this.model.recordedChunks = [];
        }

        const mediaType: "video" | "image" = file.type.startsWith("image/") ? "image" : "video";
        const id = `${mediaType}-${Math.floor(Math.random() * 10000000)}-${Date.now()}`;

        const cleanType = (file.type || "").split(";")[0].toLowerCase();
        const ext = cleanType === "video/mp4" ? "mp4"
            : cleanType.startsWith("image/") ? cleanType.split("/")[1] : "bin";
        file = new File([file], `${id}.${ext}`, {type: cleanType});

        let duration = 5;
        if (mediaType === "video") {
            try {
                duration = await getVideoDuration(file);
            } catch {
                duration = Math.max(1, (Date.now() - this.model.lastRecorderTimestamp) / 1000);
            }
        }

        const media: SyncedMedia = {
            id: `${mediaType}-${Math.floor(Math.random() * 10000000)}-${Date.now()}`,
            type: mediaType,
            timestamp: Date.now(),
            duration
        };

        const shouldSkipConversion = mediaType === "image"
            || file.type?.startsWith("video/mp4")
            || ((!file.type || file.type === "application/octet-stream")
                && (await this.sniffContainerType(file)) === "video/mp4");

        this.model.setRecordedMedia(media, shouldSkipConversion ? file : undefined);
        if (!shouldSkipConversion) {
            if (!(await this.mediaHandler.convertMedia({id: media.id, blob: file}))) return;
            this.mediaHandler.getMediaMetadata(media.id).converting = false;
        }

        //TODO make clip listen for change in converting value --> reload video (Maybe its still stored in cache???)
    }

    private async sniffContainerType(blob: Blob): Promise<"video/mp4" | "video/webm" | null> {
        const buf = new Uint8Array(await blob.slice(0, 16).arrayBuffer());
        if (buf[0] === 0x1A && buf[1] === 0x45 && buf[2] === 0xDF && buf[3] === 0xA3) return "video/webm";
        if (buf[4] === 0x66 && buf[5] === 0x74 && buf[6] === 0x79 && buf[7] === 0x70) return "video/mp4";
        return null;
    }
}