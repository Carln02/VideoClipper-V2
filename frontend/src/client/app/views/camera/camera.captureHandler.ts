import {TurboHandler} from "turbodombuilder";
import {CameraModel} from "./camera.model";

export class CameraCaptureHandler extends TurboHandler<CameraModel> {
    public initStream() {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            alert("Camera not supported.");
            return;
        }
        this.switchCamera(true);
    }

    public stopStream() {
        if (this.model.stream) this.model.stream.getTracks().forEach(track => track.stop());
    }

    public async switchCamera(initializing = false) {
        try {
            const devicesInfo = await navigator.mediaDevices.enumerateDevices();
            const videoDevices = devicesInfo.filter(device => device.kind === "videoinput");

            if (videoDevices.length === 0) return;

            if (!initializing) {
                let newDeviceLabel: string;
                do {
                    this.model.cameraDeviceIdIndex++;
                    if (this.model.cameraDeviceIdIndex >= videoDevices.length) this.model.cameraDeviceIdIndex = 0;
                    newDeviceLabel = videoDevices[this.model.cameraDeviceIdIndex].label.toLowerCase();
                } while (this.model.cameraIsLikelyFront != null && (this.model.cameraIsLikelyFront == newDeviceLabel.includes("front")));

                if (this.model.cameraIsLikelyFront != null) this.model.cameraIsLikelyFront = newDeviceLabel.includes("front");
            }

            this.model.cameraDeviceId = videoDevices[this.model.cameraDeviceIdIndex].deviceId;
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
            this.model.stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    deviceId: this.model.cameraDeviceId ? {exact: this.model.cameraDeviceId} : "",
                    aspectRatio: this.model.aspectRatio,
                    frameRate: { ideal: 30 }
                },
                audio: true
            });
        } catch (error) {
            try {
                this.model.stream = await navigator.mediaDevices.getUserMedia({
                    video: {aspectRatio: this.model.aspectRatio},
                    audio: true
                });
            } catch (error) {
                console.error("Error accessing media devices with fallback constraints.", error);
                alert(`Error accessing media devices: ${error.message}`);
            }
        }
    }

    private async checkIfCurrentStreamIsLikelyFront() {
        if (!this.model.stream) return;
        try {
            const videoTrack = this.model.stream.getVideoTracks()[0];
            if (!videoTrack) return;

            const currentDeviceLabel = (await navigator.mediaDevices.enumerateDevices())
                .find(device => device.deviceId == videoTrack.getSettings().deviceId)
                ?.label.toLowerCase();
            if (!currentDeviceLabel) return;

            if (currentDeviceLabel.includes("front")) this.model.cameraIsLikelyFront = true;
            else if (currentDeviceLabel.includes("back")) this.model.cameraIsLikelyFront = false;
        } catch (error) {
            console.error("Error getting current device label:", error);
            return null;
        }
    }

    public muteAudio(b: boolean) {
        this.model.stream?.getAudioTracks().forEach(track => track.enabled = b);
    }
}