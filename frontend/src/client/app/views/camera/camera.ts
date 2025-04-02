import {auto, define, TurboElement} from "turbodombuilder";
import "./camera.css";
import {ContextManager} from "../../managers/contextManager/contextManager";
import {ContextView} from "../../managers/contextManager/contextManager.types";
import {Card} from "../../components/card/card";
import {ClipRendererVisibility} from "../../components/clipRenderer/clipRenderer.types";
import {CameraView} from "./camera.view";
import {CameraModel} from "./camera.model";
import {CameraRecordingHandler} from "./camera.recordingHandler";
import {CameraCaptureHandler} from "./camera.captureHandler";
import {DocumentManager} from "../../managers/documentManager/documentManager";

@define("vc-camera")
export class Camera extends TurboElement<CameraView, object, CameraModel> {
    private static _instance: Camera = null;

    public readonly documentManager: DocumentManager;

    public constructor(documentManager: DocumentManager) {
        ContextManager.instance.view = ContextView.camera;
        //Cancel construction if exists already
        if (Camera.instance) {
            if (Camera.instance.parentElement == null) document.body.addChild(Camera.instance);
            return Camera.instance;
        }

        super({parent: document.body});
        Camera.instance = this;
        this.documentManager = documentManager;

        this.mvc.generate({
            viewConstructor: CameraView,
            modelConstructor: CameraModel,
            handlerConstructors: [CameraRecordingHandler, CameraCaptureHandler]
        });

        this.documentManager.toolPanel.addContextCallback(() => {
            this.documentManager.toolPanel.show(ContextManager.instance.view == ContextView.camera);
        });

        this.model.ghosting = true;
    }

    /**
     * @description The singleton instance.
     */
    public static get instance() {
        return this._instance;
    }

    private static set instance(value: Camera) {
        this._instance = value;
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
        ContextManager.instance.view = ContextView.canvas;
    }

    public startStream() {
        this.model.videoStreamOn = true;
        this.model.captureHandler.initStream();
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
