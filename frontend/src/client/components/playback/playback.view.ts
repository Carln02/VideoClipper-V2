import {DefaultEventName, div, TurboIcon, TurboView} from "turbodombuilder";
import {Playback} from "./playback";
import {PlaybackModel} from "./playback.model";
import {Timeline} from "../timeline/timeline";
import {ClipRenderer} from "../clipRenderer/clipRenderer";

export class PlaybackView extends TurboView<Playback, PlaybackModel> {
    protected scaleContainer: HTMLElement;

    protected isMaximized: boolean = false;

    public renderer: ClipRenderer;
    public timeline: Timeline;

    protected buttonsDiv: HTMLElement;
    protected closeButton: TurboIcon;
    protected maximizeButton: TurboIcon;

    public initialize() {
        super.initialize();
        this.resize();
    }

    protected setupUIElements() {
        super.setupUIElements();

        this.scaleContainer = div();
        this.renderer = new ClipRenderer({director: this.element.director, videoProperties: {playsInline: true}});
        this.timeline = new Timeline({director: this.element.director, renderer: this.renderer, initialize: true});

        this.buttonsDiv = div({classes: "buttons-div"});
        this.closeButton = new TurboIcon({icon: "x"});
        this.maximizeButton = new TurboIcon({icon: "maximize"});
    }

    protected setupUILayout() {
        super.setupUILayout();

        this.element.addChild(this.scaleContainer);
        this.buttonsDiv.addChild([this.closeButton]);
        this.element.addChild(this.buttonsDiv);

        this.scaleContainer.addChild([this.renderer, this.timeline]);
        this.element.childHandler = this.scaleContainer;
    }

    protected setupUIListeners() {
        super.setupUIListeners();
        window.addEventListener("resize", () => this.resize());
        this.closeButton.addListener(DefaultEventName.click, () => this.element.remove());
        this.maximizeButton.addListener(DefaultEventName.click, () => {
            this.isMaximized = !this.isMaximized;
            this.element.toggleClass("maximized-playback", this.isMaximized);
            this.maximizeButton.icon = this.isMaximized ? "minimize" : "maximize";
            requestAnimationFrame(() => requestAnimationFrame(() => this.resize()));
        });
    }

    public resize() {
        this.renderer.resize(this.model.aspectRatio, this.timeline.offsetWidth);
    }

    public showControlButtons(b: boolean) {
        this.buttonsDiv.style.display = b ? "" : "none";
    }
}