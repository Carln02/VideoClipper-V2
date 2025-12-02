import {auto, controller, define, element, expose, turbo} from "turbodombuilder";
import "./camera.css";
import {Card} from "../../components/card/card";
import {ClipRendererVisibility} from "../../components/clipRenderer/clipRenderer.types";
import {CameraView} from "./camera.view";
import {CameraModel} from "./camera.model";
import {CameraRecordingController} from "./camera.recordingController";
import {CameraCaptureHandler} from "./camera.captureHandler";
import {VcComponent} from "../../components/component/component";
import {Clip} from "../../components/clip/clip";
import {Project} from "../../directors/project/project";
import {ProjectScreens, ToolType} from "../../directors/project/project.types";
import {SyncedMedia} from "../../handlers/mediaHandler/mediaHandler.types";
import {ShootingPanel} from "../../panels/shootingPanel/shootingPanel";
import {replaceUrlParams} from "../../utils/url";
import {VcProperties} from "../../components/component/component.types";

@define("vc-camera")
export class Camera extends VcComponent<CameraView, object, CameraModel, Project> {
    @controller() protected recordingController: CameraRecordingController;

    @expose("model", false) public accessor ghosting: boolean;
    @expose("view.clipRenderer") public accessor visibilityMode: ClipRendererVisibility;
    @expose("view.clipRenderer") public accessor currentCanvasFill: string | null;

    public initialize() {
        super.initialize();
        this.model.ghosting = true;
        this.mvc.emitter.add("recordedMedia", async (media: SyncedMedia, blob?: Blob) => {
            await this.director.mediaHandler.saveMedia(media, blob);
            this.card.addClip(Clip.createData({endTime: (media?.duration ?? 5), mediaId: media.id}),
                this.view.timeline.currentClipInfo.closestIntersection);
        });
    }

    @auto() public set card(value: Card) {
        this.view.timeline.card = value;
        this.view.metadataDrawer.card = value;
        replaceUrlParams({name: "card", value: value.dataId});
        (this.director.toolPanel.getPanel(ToolType.shoot, ProjectScreens.camera) as ShootingPanel).refresh();
    }

    public get frameWidth() {
        return this.view.clipRenderer.offsetWidth;
    }

    public get frameHeight() {
        return this.view.clipRenderer.offsetHeight;
    }

    public clear() {
        this.view.timeline.data = undefined; //TODO idk if gd idea
        this.director.currentType = ProjectScreens.canvas;
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

    public snapToClip(clip: Clip) {
        if (clip) this.view.timeline.snapToClosest(clip.dataIndex + 1);
        else this.view.timeline.snapAtEnd();
    }

    public async switchCamera() {
        await this.model.captureHandler.switchCamera();
    }

    public muteAudio(b: boolean) {
        this.model.captureHandler.muteAudio(b);
    }

    public startRecording() {
        this.recordingController.startRecording();
    }

    public stopRecording() {
        this.recordingController.stopRecording();
    }

    public set visible(value: boolean) {
        this.visibilityMode = value ? ClipRendererVisibility.shown
            : (this.ghosting ? ClipRendererVisibility.ghosting : ClipRendererVisibility.hidden);
    }

    public snapPicture() {
        if (!this.model.stream) return;
        this.view.cameraRenderer.drawVideoFrame().then(picture => this.recordingController.saveMedia(picture));
    }

    public async uploadMedia(media: Blob) {
        if (!media) return;
        await this.recordingController.saveMedia(media);
    }
}

export function camera(properties: VcProperties<CameraView, object, CameraModel, Project>): Camera {
    turbo(properties).applyDefaults({
        tag: "vc-camera",
        view: CameraView,
        model: CameraModel,
        handlers: CameraCaptureHandler,
        controllers: CameraRecordingController
    });
    return element({...properties}) as Camera;
}