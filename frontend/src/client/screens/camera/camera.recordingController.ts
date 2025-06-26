import {TurboController} from "turbodombuilder";
import {CameraModel} from "./camera.model";
import {Camera} from "./camera";
import {CameraView} from "./camera.view";
import {SyncedMedia} from "../../handlers/mediaHandler/mediaHandler.types";
import {MediaHandler} from "../../handlers/mediaHandler/mediaHandler";

export class CameraRecordingController extends TurboController<Camera, CameraView, CameraModel> {
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

    protected setupMediaRecorder() {
        if (!this.model.stream) {
            alert("No stream available to record.");
            return;
        }

        this.model.mediaRecorder = new MediaRecorder(this.model.stream, {videoBitsPerSecond: 2500000});

        this.model.mediaRecorder.onstop = () => this.saveRecording();
        this.model.mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) this.model.recordedChunks.push(event.data);
        };
    }

    private async saveRecording() {
        if (this.model.recordedChunks.length == 0) return;

        const media: SyncedMedia = {
            id: `video-${Math.floor(Math.random() * 10000000)}-${Date.now()}`,
            type: "video",
            timestamp: Date.now(),
            duration: (Date.now() - this.model.lastRecorderTimestamp) / 1000,
            converting: true
        };
        this.model.setRecordedMedia(media, undefined);

        const blob = new Blob(this.model.recordedChunks, {type: "video/webm"});
        this.model.recordedChunks = [];

        if (!(await this.mediaHandler.convertMedia({id: media.id, blob: blob}))) return;
        this.mediaHandler.getMediaMetadata(media.id).converting = false;

        //TODO make clip listen for change in converting value --> reload video
        // const mp4Blob = await response.blob();
        // const videoURL = URL.createObjectURL(mp4Blob);
        //
        // const data = await this.model.ffmpeg.readFile("output.mp4");
        // media.blob = new Blob([data], {type: "video/mp4"});
        // this.model.updatedMedia = media;
    }
}