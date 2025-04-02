import {SyncedMediaWithoutId} from "./captureManager.types";
import {Camera} from "../../views/camera/camera";
import {add_video} from "../../../sync/videostore";

export class CaptureManager {
    private stream: MediaStream;

    private deviceIdIndex = 0;
    private deviceId = null;
    private isLikelyFront: boolean | null = null;

    private mediaRecorder: MediaRecorder;
    private recordedChunks: Blob[] = [];

    private lastTimestamp: number;
    private lastMedia: SyncedMediaWithoutId;

    public initStream() {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            alert("Camera not supported.");
            return;
        }
        this.switchCamera(true);
    }

    public stopStream() {
        if (this.stream) this.stream.getTracks().forEach(track => track.stop());
    }

    public async switchCamera(initializing = false) {
        try {
            const devicesInfo = await navigator.mediaDevices.enumerateDevices();
            const videoDevices = devicesInfo.filter(device => device.kind === "videoinput");

            if (videoDevices.length === 0) return;

            if (!initializing) {
                let newDeviceLabel: string;
                do {
                    this.deviceIdIndex++;
                    if (this.deviceIdIndex >= videoDevices.length) this.deviceIdIndex = 0;
                    newDeviceLabel = videoDevices[this.deviceIdIndex].label.toLowerCase();
                } while (this.isLikelyFront != null && (this.isLikelyFront == newDeviceLabel.includes("front")));

                if (this.isLikelyFront != null) this.isLikelyFront = newDeviceLabel.includes("front");
            }

            this.deviceId = videoDevices[this.deviceIdIndex].deviceId;
            await this.startStream();
            if (initializing) await this.checkIfCurrentStreamIsLikelyFront();
        } catch (error) {
            console.error("Error enumerating devices.", error);
            alert(`Error enumerating devices: ${error.message}`);
        }
    }

    private async startStream() {
        this.stopStream();

        try {
            this.stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    deviceId: this.deviceId ? {exact: this.deviceId} : "",
                    aspectRatio: this.camera.aspectRatio,
                    frameRate: { ideal: 30 }
                },
                audio: true
            });
            this.camera.videoStream.srcObject = this.stream;
            this.setupMediaRecorder();
        } catch (error) {
            try {
                this.stream = await navigator.mediaDevices.getUserMedia({
                    video: {aspectRatio: this.camera.aspectRatio},
                    audio: true
                });
                this.camera.videoStream.srcObject = this.stream;
                this.setupMediaRecorder();
            } catch (error) {
                console.error("Error accessing media devices with fallback constraints.", error);
                alert(`Error accessing media devices: ${error.message}`);
            }
        }
    }

    private async checkIfCurrentStreamIsLikelyFront() {
        if (!this.stream) return;
        try {
            const videoTrack = this.stream.getVideoTracks()[0];
            if (!videoTrack) return;

            const currentDeviceLabel = (await navigator.mediaDevices.enumerateDevices())
                .find(device => device.deviceId == videoTrack.getSettings().deviceId)
                ?.label.toLowerCase();
            if (!currentDeviceLabel) return;

            if (currentDeviceLabel.includes("front")) this.isLikelyFront = true;
            else if (currentDeviceLabel.includes("back")) this.isLikelyFront = false;
        } catch (error) {
            console.error("Error getting current device label:", error);
            return null;
        }
    }

    private setupMediaRecorder() {
        if (!this.stream) {
            alert("No stream available to record.");
            return;
        }

        this.mediaRecorder = new MediaRecorder(this.stream, {videoBitsPerSecond: 2500000});

        this.mediaRecorder.onstop = () => this.saveRecording();
        this.mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) this.recordedChunks.push(event.data);
        };
    }

    public muteAudio(b: boolean) {
        this.stream?.getAudioTracks().forEach(track => track.enabled = b);
    }

    public startRecording() {
        if (!this.mediaRecorder || this.mediaRecorder.state != "inactive") {
            console.log("Unable to start recording");
            return;
        }

        this.mediaRecorder.start(100);
        this.lastTimestamp = Date.now();
    }

    public stopRecording() {
        if (!this.mediaRecorder || this.mediaRecorder.state != "recording") {
            console.log("No recording in progress");
            return;
        }
        this.mediaRecorder.stop();
    }

    private async saveRecording() {
        if (this.recordedChunks.length == 0) return;
        const blob = new Blob(this.recordedChunks, {type: "video/webm"});
        const reader = new FileReader();

        reader.onloadend = async ()  => {
            await this.saveMedia("video", reader.result as string);
            this.recordedChunks = [];
        }
        reader.readAsDataURL(blob);
    }

    public snapPicture() {
        if (!this.stream) return;
        this.camera.drawCurrentVideoFrame().then(picture => this.saveMedia("image", picture));
    }

    private async saveMedia(type: "video" | "image", data: string) {
        this.lastMedia = {
            type: type,
            timestamp: Date.now(),
        };

        if (type == "video") this.lastMedia.duration = (Date.now() - this.lastTimestamp) / 1000;

        const mediaId = add_video(data, this.lastMedia);
        // await this.camera.card.addClip(proxied({
        //     startTime: 0 as YNumber,
        //     endTime: (this.lastMedia.duration ? this.lastMedia.duration : 5) as YNumber,
        //     mediaId: mediaId,
        //     content: [] as YProxiedArray<SyncedText>
        // }), this.camera.card.timeline.currentClip.index);
    }
}
