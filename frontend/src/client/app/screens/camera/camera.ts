import {auto, define} from "turbodombuilder";
import "./camera.css";
import {Card} from "../../components/card/card";
import {ClipRendererVisibility} from "../../components/clipRenderer/clipRenderer.types";
import {CameraView} from "./camera.view";
import {CameraModel} from "./camera.model";
import {CameraRecordingHandler} from "./camera.recordingHandler";
import {CameraCaptureHandler} from "./camera.captureHandler";
import {DocumentManager} from "../../managers/documentManager/documentManager";
import {DocumentScreens} from "../../managers/documentManager/documentManager.types";
import {VcComponent} from "../../components/component/component";
import {Clip} from "../../components/clip/clip";

@define("vc-camera")
export class Camera extends VcComponent<CameraView, object, CameraModel, DocumentManager> {
    public constructor(documentManager: DocumentManager) {
        super({screenManager: documentManager});

        this.mvc.generate({
            viewConstructor: CameraView,
            modelConstructor: CameraModel,
            handlerConstructors: [CameraRecordingHandler, CameraCaptureHandler]
        });

        this.model.ghosting = true;

        this.mvc.emitter.add("savedMedia", async () => {
            await this.card.addClip(Clip.createData({
                endTime: (this.model.lastSavedMedia?.duration ? this.model.lastSavedMedia.duration : 5),
                mediaId: this.model.lastSavedMedia.id,
            }), this.card.timeline.currentClipInfo.index);
        });
    }

    @auto()
    public set card(value: Card) {
        this.view.timeline.card = value;
        this.view.metadataDrawer.card = value;
    }

    public get frameWidth() {
        return this.view.clipRenderer.offsetWidth;
    }

    public get frameHeight() {
        return this.view.clipRenderer.offsetHeight;
    }

    public fillCanvas(fill?: string | null) {
        this.view.clipRenderer.setFill(fill);
    }

    public get ghosting(): boolean {
        return this.model.ghosting;
    }

    public clear() {
        this.view.timeline.data = undefined; //TODO idk if gd idea
        this.screenManager.currentType = DocumentScreens.canvas;
    }

    public async startStream() {
        this.model.videoStreamOn = true;
        await this.model.captureHandler.initStream();
        this.visibilityMode = this.ghosting ? ClipRendererVisibility.ghosting : ClipRendererVisibility.hidden;
    }

    public stopStream() {
        this.model.videoStreamOn = false;
        this.model.captureHandler.stopStream();
        this.visibilityMode = ClipRendererVisibility.shown;
    }

    public async switchCamera() {
        await this.model.captureHandler.switchCamera();
    }

    public muteAudio(b: boolean) {
        this.model.captureHandler.muteAudio(b);
    }

    public startRecording() {
        this.model.recordingHandler.startRecording();
    }

    public stopRecording() {
        this.model.recordingHandler.stopRecording();
    }

    public set visibilityMode(value: ClipRendererVisibility) {
        this.view.clipRenderer.visibilityMode = value;
    }

    public set visible(value: boolean) {
        this.visibilityMode = value ? ClipRendererVisibility.shown
            : (this.ghosting ? ClipRendererVisibility.ghosting : ClipRendererVisibility.hidden);
    }

    public snapPicture() {
        if (!this.model.stream) return;
        //TODO this.view.cameraRenderer.drawCurrentVideoFrame().then(picture => this.saveMedia("image", picture));
    }
}
