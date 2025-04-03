import {Open, Side, TurboView} from "turbodombuilder";
import {Camera} from "./camera";
import {CameraModel} from "./camera.model";
import {CameraRenderer} from "../../components/cameraRenderer/cameraRenderer";
import {ClipRenderer} from "../../components/clipRenderer/clipRenderer";
import {Toolbar} from "../../components/toolbar/toolbar";
import {Timeline} from "../../components/timeline/timeline";
import {MetadataDrawer} from "../../components/metadataDrawer/metadataDrawer";
import {ToolType} from "../../managers/toolManager/toolManager.types";

export class CameraView extends TurboView<Camera, CameraModel> {
    public cameraRenderer: CameraRenderer;
    public clipRenderer: ClipRenderer;

    public toolbar: Toolbar;
    public timeline: Timeline;
    public metadataDrawer: MetadataDrawer;

    initialize() {
        super.initialize();
        this.resize();
    }

    protected setupUIElements() {
        super.setupUIElements();

        this.cameraRenderer = new CameraRenderer({screenManager: this.element.screenManager, videoProperties: {autoplay: true, muted: true, playsInline: true}});
        this.clipRenderer = new ClipRenderer({screenManager: this.element.screenManager, videoProperties: {playsInline: true}});

        //TODO this.sidePanel = new SidePanel(this.element, this.captureManager);

        this.toolbar = new Toolbar({classes: "left-toolbar", screenManager: this.element.screenManager});
        this.toolbar.populateWith(ToolType.selection, ToolType.shoot, ToolType.text, ToolType.delete);

        this.timeline = new Timeline({
            screenManager: this.element.screenManager,
            card: this.element.card,
            renderer: this.clipRenderer,
            direction: Side.top,
            offset: {[Open.open]: -4},
            initiallyOpen: true
        });

        this.metadataDrawer = new MetadataDrawer({
            card: this.element.card,
            direction: Side.bottom,
            initiallyOpen: true,
            offset: {[Open.open]: 6}
        });
    }

    protected setupUILayout() {
        super.setupUILayout();

        this.element.addChild([this.cameraRenderer, this.clipRenderer, this.toolbar,
            this.timeline, this.metadataDrawer]);
    }

    protected setupChangedCallbacks() {
        super.setupChangedCallbacks();

        this.emitter.add("stream", (value: MediaStream) => this.cameraRenderer.video.srcObject = value);
        this.emitter.add("ghosting", (value: boolean) => {
            if (this.model.videoStreamOn) this.clipRenderer.setStyle("opacity", value ? "0.2" : "0");
        });
    }

    protected setupUIListeners() {
        super.setupUIListeners();
        window.addEventListener("resize", () => this.resize());
    }

    public resize() {
        this.cameraRenderer.resize(this.model.aspectRatio, window.innerWidth, window.innerHeight);
        this.clipRenderer.resize(this.model.aspectRatio, window.innerWidth, window.innerHeight);
    }
}