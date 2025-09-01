import {DefaultEventName, div, icon, Open, Side, TurboIcon, TurboView} from "turbodombuilder";
import {Camera} from "./camera";
import {CameraModel} from "./camera.model";
import {ClipRenderer} from "../../components/clipRenderer/clipRenderer";
import {Toolbar} from "../../components/toolbar/toolbar";
import {MetadataDrawer} from "../../components/metadataDrawer/metadataDrawer";
import {Renderer} from "../../components/renderer/renderer";
import {ShootingTimeline} from "../../components/timeline/shootingTimeline/shootingTimeline";
import {ClipRendererVisibility} from "../../components/clipRenderer/clipRenderer.types";


export class CameraView extends TurboView<Camera, CameraModel> {
    public cameraRenderer: Renderer;
    public clipRenderer: ClipRenderer;

    public toolbar: Toolbar;
    public timeline: ShootingTimeline;
    public metadataDrawer: MetadataDrawer;
    protected backButton: TurboIcon;

    initialize() {
        super.initialize();
        this.resize();
    }

    protected setupUIElements() {
        super.setupUIElements();

        this.backButton = icon({icon: "arrow-right"});

        this.cameraRenderer = new Renderer({director: this.element.director,
            videoProperties: {autoplay: true, muted: true, playsInline: true}});
        this.clipRenderer = new ClipRenderer({director: this.element.director, videoProperties: {playsInline: true}});

        this.toolbar = new Toolbar({classes: "right-toolbar", director: this.element.director});
        // this.toolbar.populateWith(ToolType.selection, ToolType.shoot, ToolType.text, ToolType.delete);

        this.timeline = new ShootingTimeline({
            drawerProperties: {
                side: Side.right,
                icon: "chevron",
                offset: {[Open.open]: -4},
                initiallyOpen: true
            },
            director: this.element.director,
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

        this.element.addChild(div({classes: "back-button-div", children: [this.backButton]}));
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
        this.backButton.addListener(DefaultEventName.click, () => history.back());

        this.timeline.onPlay = (b: boolean) => {
            this.cameraRenderer.show(!b);
            this.clipRenderer.visibilityMode = b ? ClipRendererVisibility.shown : this.element.ghosting
                ? ClipRendererVisibility.ghosting : ClipRendererVisibility.hidden;
        }
    }

    public resize() {
        this.cameraRenderer.resize(this.model.aspectRatio, window.innerWidth, window.innerHeight);
        this.clipRenderer.resize(this.model.aspectRatio, window.innerWidth, window.innerHeight);
    }
}