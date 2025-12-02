import {DefaultEventName, div, icon, turbo, TurboIcon, TurboView} from "turbodombuilder";
import {Playback} from "./playback";
import {PlaybackModel} from "./playback.model";
import {timeline, Timeline} from "../timeline/timeline";
import {clipRenderer, ClipRenderer} from "../clipRenderer/clipRenderer";

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
        this.renderer = clipRenderer({director: this.element.director, videoProperties: {playsInline: true}});
        this.timeline = timeline({director: this.element.director, renderer: this.renderer});

        this.buttonsDiv = div({classes: "buttons-div"});
        this.closeButton = icon({icon: "x"});
        this.maximizeButton = icon({icon: "maximize"});
    }

    protected setupUILayout() {
        super.setupUILayout();

        turbo(this).addChild([this.scaleContainer, this.buttonsDiv]);
        turbo(this.buttonsDiv).addChild([this.closeButton]);
        turbo(this.scaleContainer).addChild([this.renderer, this.timeline]);
        turbo(this).childHandler = this.scaleContainer;
    }

    protected setupUIListeners() {
        super.setupUIListeners();
        window.addEventListener("resize", () => this.resize());
        turbo(this.closeButton).on(DefaultEventName.click, () => this.element.remove());
        turbo(this.maximizeButton).on(DefaultEventName.click, () => {
            this.isMaximized = !this.isMaximized;
            turbo(this).toggleClass("maximized-playback", this.isMaximized);
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