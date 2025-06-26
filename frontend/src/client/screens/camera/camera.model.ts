import {auto, TurboModel} from "turbodombuilder";
import {CameraCaptureHandler} from "./camera.captureHandler";
import {SyncedMedia} from "../../handlers/mediaHandler/mediaHandler.types";

export class CameraModel extends TurboModel {
    public readonly aspectRatio = 1.33 as const;

    public videoStreamOn: boolean = false;

    public cameraDeviceIdIndex = 0;
    public cameraDeviceId = null;
    public cameraIsLikelyFront: boolean | null = null;

    public mediaRecorder: MediaRecorder;
    public recordedChunks: Blob[] = [];

    public lastRecorderTimestamp: number;

    public constructor(data?: any) {
        super(data);
    }

    public setRecordedMedia(data: SyncedMedia, blob: Blob) {
        this.fireCallback("recordedMedia", data, blob);
    }

    @auto()
    public set stream(value: MediaStream) {
        this.fireCallback("stream", value);
    }

    @auto()
    public set lastSavedMedia(value: SyncedMedia) {
        this.fireCallback("savedMedia", value);
    }

    @auto()
    public set ghosting(value: boolean) {
        this.fireCallback("ghosting", value);
    }

    public get captureHandler(): CameraCaptureHandler {
        return this.getHandler("capture") as CameraCaptureHandler;
    }
}