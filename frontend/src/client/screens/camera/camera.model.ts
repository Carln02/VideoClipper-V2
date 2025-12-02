import {handler, signal, TurboModel} from "turbodombuilder";
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

    @signal public stream: MediaStream;
    @signal public lastSavedMedia: SyncedMedia;
    @signal public ghosting: boolean;

    @handler() public captureHandler: CameraCaptureHandler;

    public setRecordedMedia(data: SyncedMedia, blob: Blob) {
        this.fireCallback("recordedMedia", data, blob);
    }
}