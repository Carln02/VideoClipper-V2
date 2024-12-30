import {auto, define, TurboElement} from "turbodombuilder";
import "./camera.css";
import {CaptureManager} from "./manager/captureManager/captureManager";
import {Toolbar} from "../../components/toolbar/toolbar";
import {ContextManager} from "../../managers/contextManager/contextManager";
import {ContextView} from "../../managers/contextManager/contextManager.types";
import {ClipRenderer} from "../../components/clipRenderer/clipRenderer";
import {Card} from "../../components/card/card";
import {Clip} from "../../components/clip/clip";
import {Timeline} from "../../components/timeline/timeline";
import {CameraRenderer} from "../../components/cameraRenderer/cameraRenderer";
import {ToolType} from "../../managers/toolManager/toolManager.types";
import {SidePanel} from "../../components/sidePanel/sidePanel";
import {ClipRendererVisibility} from "../../components/clipRenderer/clipRenderer.types";
import {Direction} from "../../components/basicComponents/panelThumb/panelThumb.types";
import {MetadataDrawer} from "../../components/metadataDrawer/metadataDrawer";

@define("vc-camera")
export class Camera extends TurboElement {
    private static _instance: Camera = null;

    public readonly aspectRatio = 1.33 as const;

    private readonly captureManager: CaptureManager;

    private _card: Card;
    private readonly cameraRenderer: CameraRenderer;
    private readonly clipRenderer: ClipRenderer;

    private readonly toolbar: Toolbar;
    readonly sidePanel: SidePanel;
    private timeline: Timeline;
    private metadataDrawer: MetadataDrawer;

    private videoStreamOn: boolean = false;
    private _ghosting: boolean = true;

    constructor() {
        ContextManager.instance.view = ContextView.camera;
        //Cancel construction if exists already
        if (Camera.instance) {
            if (Camera.instance.parentElement == null) {
                document.body.addChild(Camera.instance);
            }
            return Camera.instance;
        }

        super({parent: document.body});
        Camera.instance = this;

        this.captureManager = new CaptureManager(this);

        this.cameraRenderer = new CameraRenderer({parent: this},
            {autoplay: true, muted: true, playsInline: true});
        this.clipRenderer = new ClipRenderer({parent: this}, {playsInline: true});

        this.sidePanel = new SidePanel(this, this.captureManager);

        this.toolbar = new Toolbar({parent: this, classes: "left-toolbar"});
        this.toolbar.populateWith(ToolType.selection, ToolType.shoot, ToolType.text, ToolType.delete);

        this.resize();
        window.addEventListener("resize", () => this.resize());

        this.ghosting = true;
    }

    public initialize(card: Card) {
        this.card = card;

        // if (!this.timeline) this.timeline = new Timeline(card.data.syncedClips, this.clipRenderer, {
        //     parent: this,
        //     direction: Direction.top,
        //     openOffset: -4,
        //     initiallyClosed: false,
        //     invertOpenAndClosedValues: true
        // });
        // else this.timeline.data = card.data.syncedClips;
        //
        // this.metadataDrawer = new MetadataDrawer(card.data.metadata, {
        //     parent: this,
        //     direction: Direction.bottom,
        //     initiallyClosed: false,
        //     openOffset: 6
        // });

        const selectedClip = ContextManager.instance.getContext(2);
        if (selectedClip && selectedClip[0] instanceof Clip) this.timeline.snapToClosest();
        else this.timeline.snapAtEnd();

        this.timeline.reloadCurrentClip(true);
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

    public get card() {
        return this._card;
    }

    private set card(value: Card) {
        this._card = value;
    }

    public get videoStream() {
        return this.cameraRenderer.video;
    }

    @auto()
    public set ghosting(value: boolean) {
        if (this.videoStreamOn) this.clipRenderer.style.opacity = value ? "0.2" : "0";
    }

    private resize() {
        this.cameraRenderer.resize(this.aspectRatio, window.innerWidth, window.innerHeight);
        this.clipRenderer.resize(this.aspectRatio, window.innerWidth, window.innerHeight);
    }

    public get frameWidth() {
        return this.clipRenderer.offsetWidth;
    }

    public get frameHeight() {
        return this.clipRenderer.offsetHeight;
    }

    public async drawCurrentVideoFrame(animate = true): Promise<string> {
        return this.cameraRenderer.drawCurrentVideoFrame(animate);
    }

    public fillCanvas(fill?: string | null) {
        this.clipRenderer.setCanvas(fill);
    }

    public clear() {
        this.timeline.data = undefined; //TODO idk if gd idea
        ContextManager.instance.view = ContextView.canvas;
    }

    public startStream() {
        this.videoStreamOn = true;
        this.captureManager.initStream();
        this.visibilityMode = this.ghosting ? ClipRendererVisibility.ghosting : ClipRendererVisibility.hidden;
    }

    public stopStream() {
        this.videoStreamOn = false;
        this.captureManager.stopStream();
        this.visibilityMode = ClipRendererVisibility.shown;
    }

    public set visibilityMode(value: ClipRendererVisibility) {
        this.clipRenderer.visibilityMode = value;
    }

    public set visible(value: boolean) {
        this.visibilityMode = value ? ClipRendererVisibility.shown
            : (this.ghosting ? ClipRendererVisibility.ghosting : ClipRendererVisibility.hidden);
    }
}
