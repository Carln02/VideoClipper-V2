import {auto, TurboModel} from "turbodombuilder";
import {CameraCaptureHandler} from "./camera.captureHandler";
import {CameraRecordingHandler} from "./camera.recordingHandler";

export class CameraModel extends TurboModel {
    public readonly aspectRatio = 1.33 as const;

    public videoStreamOn: boolean = false;

    public cameraDeviceIdIndex = 0;
    public cameraDeviceId = null;
    public cameraIsLikelyFront: boolean | null = null;

    public mediaRecorder: MediaRecorder;
    public recordedChunks: Blob[] = [];

    public lastRecorderTimestamp: number;

    @auto()
    public set stream(value: MediaStream) {
        this.fireCallback("stream", value);
        this.recordingHandler.setupMediaRecorder();
    }

    @auto()
    public set ghosting(value: boolean) {
        this.fireCallback("ghosting", value);
    }

    public get captureHandler(): CameraCaptureHandler {
        return this.getHandler("capture") as CameraCaptureHandler;
    }

    public get recordingHandler(): CameraRecordingHandler {
        return this.getHandler("recording") as CameraRecordingHandler;
    }
}