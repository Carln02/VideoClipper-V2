import {define} from "turbodombuilder";
import "./shootingPanel.css";
import {ToolPanelContent} from "../toolPanelContent/toolPanelContent";
import {ShootingPanelView} from "./shootingPanel.view";
import {ShootingPanelModel} from "./shootingPanel.model";
import {Camera} from "../../views/camera/camera";
import {CaptureMode} from "../../managers/captureManager/captureManager.types";
import {ClipRendererVisibility} from "../../components/clipRenderer/clipRenderer.types";
import {ToolPanelContentProperties} from "../toolPanelContent/toolPanelContent.types";

@define()
export class ShootingPanel extends ToolPanelContent<ShootingPanelView, object, ShootingPanelModel> {
    public readonly camera: Camera;

    private _mode: CaptureMode;

    public constructor(properties: ToolPanelContentProperties<ShootingPanelView, object, ShootingPanelModel>) {
        super(properties);
        this.camera = Camera.instance;
        this.mvc.generate({
            modelConstructor: ShootingPanelModel,
            viewConstructor: ShootingPanelView
        })
    }

    public attach() {}
    public detach() {}

    public get mode(): CaptureMode {
        return this._mode;
    }

    public set mode(value: string) {
        if (this.mode == value) return;
        if (this.mode == CaptureMode.videoShooting) this.stopShooting();
        this._mode = value as CaptureMode;
        this.updateCamera();
        this.view.refresh();
        if (value == CaptureMode.videoShooting) this.startShooting();
    }

    public updateCamera() {
        if (this.mode == CaptureMode.create) {
            this.camera.visible = true;
            this.camera.fillCanvas(this.backgroundSelector.selectedValue);
        } else if (this.mode == CaptureMode.videoShooting) {
            this.camera.visibilityMode = ClipRendererVisibility.hidden;
        } else {
            this.camera.visible = false;
        }
    }

    private stopShooting() {
        this.view.captureTimer.stop();
        this.camera.stopRecording();
    }

    private startShooting() {
        this.view.captureTimer.start();
        this.camera.startRecording();
    }
}
