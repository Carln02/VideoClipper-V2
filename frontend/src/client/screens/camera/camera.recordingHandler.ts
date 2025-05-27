import {TurboHandler} from "turbodombuilder";
import {CameraModel} from "./camera.model";

export class CameraRecordingHandler extends TurboHandler<CameraModel> {
    public setupMediaRecorder() {
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

    private async saveRecording() {
        if (this.model.recordedChunks.length == 0) return;
        this.model.lastRecordedMedia = {
            type: "video",
            timestamp: Date.now(),
            duration: (Date.now() - this.model.lastRecorderTimestamp) / 1000,
            blob: new Blob(this.model.recordedChunks, {type: "video/webm"})
        };
        this.model.recordedChunks = [];


        //TODO
        // const reader = new FileReader();
        //
        // reader.onloadend = async ()  => {
        //     media.id = await add_video(reader.result as string, media) as string;
        //     this.model.lastSavedMedia = media;
        //     this.model.recordedChunks = [];
        // }
        // reader.readAsDataURL(blob);
    }
}