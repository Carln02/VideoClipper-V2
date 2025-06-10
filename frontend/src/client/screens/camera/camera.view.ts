import {Open, Side, TurboView} from "turbodombuilder";
import {Camera} from "./camera";
import {CameraModel} from "./camera.model";
import {ClipRenderer} from "../../components/clipRenderer/clipRenderer";
import {Toolbar} from "../../components/toolbar/toolbar";
import {Timeline} from "../../components/timeline/timeline";
import {MetadataDrawer} from "../../components/metadataDrawer/metadataDrawer";
import {ToolType} from "../../managers/toolManager/toolManager.types";
import {Renderer} from "../../components/renderer/renderer";
import {ClipTimeline} from "../../components/timeline/clipTimeline/clipTimeline";
import {ShootingTimeline} from "../../components/timeline/shootingTimeline/shootingTimeline";


export class CameraView extends TurboView<Camera, CameraModel> {
    public cameraRenderer: Renderer;
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

        this.cameraRenderer = new Renderer({screenManager: this.element.screenManager,
            videoProperties: {autoplay: true, muted: true, playsInline: true}});
        this.clipRenderer = new ClipRenderer({screenManager: this.element.screenManager, videoProperties: {playsInline: true}});

        //TODO this.sidePanel = new SidePanel(this.element, this.captureManager);

        this.toolbar = new Toolbar({classes: "right-toolbar", screenManager: this.element.screenManager});
        this.toolbar.populateWith(ToolType.selection, ToolType.shoot, ToolType.text, ToolType.delete);

        this.timeline = new ShootingTimeline({
            drawerProperties: {
                side: Side.top,
                icon: "chevron",
                offset: {[Open.open]: -4},
                initiallyOpen: true
            },
            screenManager: this.element.screenManager,
            card: this.element.card,
            scaled: false,
            renderer: this.clipRenderer,
        });

        this.metadataDrawer = new MetadataDrawer({
            card: this.element.card,
            side: Side.bottom,
            icon: "chevron",
            initiallyOpen: false,
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

        this.emitter.add("stream", () => this.cameraRenderer.video.srcObject = this.model.stream);
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