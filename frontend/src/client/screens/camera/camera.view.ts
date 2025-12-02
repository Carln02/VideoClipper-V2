import {DefaultEventName, Direction, div, effect, icon, Open, Side, turbo, TurboIcon, TurboView} from "turbodombuilder";
import {Camera} from "./camera";
import {CameraModel} from "./camera.model";
import {clipRenderer, ClipRenderer} from "../../components/clipRenderer/clipRenderer";
import {Toolbar, toolbar} from "../../components/toolbar/toolbar";
import {metadataDrawer, MetadataDrawer} from "../../components/metadataDrawer/metadataDrawer";
import {renderer, Renderer} from "../../components/renderer/renderer";
import {ClipRendererVisibility} from "../../components/clipRenderer/clipRenderer.types";
import {ClipTimeline, clipTimeline} from "../../components/timeline/clipTimeline/clipTimeline";


export class CameraView extends TurboView<Camera, CameraModel> {
    public cameraRenderer: Renderer;
    public clipRenderer: ClipRenderer;

    public toolbar: Toolbar;
    public timeline: ClipTimeline;
    public metadataDrawer: MetadataDrawer;
    protected backButton: TurboIcon;

    public initialize() {
        super.initialize();
        this.resize();
    }

    protected setupUIElements() {
        super.setupUIElements();

        this.backButton = icon({icon: "arrow-right"});

        this.cameraRenderer = renderer({
            director: this.element.director,
            videoProperties: {autoplay: true, muted: true, playsInline: true}
        });
        this.clipRenderer = clipRenderer({
            director: this.element.director,
            videoProperties: {playsInline: true}
        });

        this.toolbar = toolbar({classes: "right-toolbar", director: this.element.director});
        // this.toolbar.populateWith(ToolType.selection, ToolType.shoot, ToolType.text, ToolType.delete);

        this.timeline = clipTimeline({
            drawerProperties: {
                side: Side.right,
                icon: "chevron",
                offset: {[Open.open]: -4},
                initiallyOpen: true
            },
            classes: "vc-shooting-timeline",
            orientation: Direction.vertical,
            director: this.element.director,
            card: this.element.card,
            scaled: false,
            renderer: this.clipRenderer,
        });

        this.metadataDrawer = metadataDrawer({
            card: this.element.card,
            side: Side.bottom,
            icon: "chevron",
            initiallyOpen: false,
            offset: {[Open.open]: 6}
        });
    }

    protected setupUILayout() {
        super.setupUILayout();
        turbo(this).addChild([
            div({classes: "back-button-div", children: [this.backButton]}),
            this.cameraRenderer, this.clipRenderer, this.toolbar,
            this.timeline, this.metadataDrawer
        ]);
    }

    protected setupUIListeners() {
        super.setupUIListeners();
        window.addEventListener("resize", () => this.resize());
        turbo(this.backButton).on(DefaultEventName.click, () => history.back());

        this.timeline.onPlay = (b: boolean) => {
            turbo(this.cameraRenderer).show(!b);
            this.clipRenderer.visibilityMode = b ? ClipRendererVisibility.shown : this.element.ghosting
                ? ClipRendererVisibility.ghosting : ClipRendererVisibility.hidden;
        }
    }

    @effect private streamChanged() {
        this.cameraRenderer.video.srcObject = this.model.stream;
    }

    @effect private ghostingChanged() {
        if (this.model.videoStreamOn) turbo(this.clipRenderer).setStyle("opacity", this.model.ghosting ? "0.2" : "0");
    }

    public resize() {
        this.cameraRenderer.resize(this.model.aspectRatio, window.innerWidth, window.innerHeight);
        this.clipRenderer.resize(this.model.aspectRatio, window.innerWidth, window.innerHeight);
    }
}