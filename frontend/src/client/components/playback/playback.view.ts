import {div, TurboView} from "turbodombuilder";
import {Playback} from "./playback";
import {PlaybackModel} from "./playback.model";
import {Timeline} from "../timeline/timeline";
import {ClipRenderer} from "../clipRenderer/clipRenderer";

export class PlaybackView extends TurboView<Playback, PlaybackModel> {
    protected scaleContainer: HTMLElement;

    public renderer: ClipRenderer;
    public timeline: Timeline;

    public initialize() {
        super.initialize();
        this.resize();
    }

    protected setupUIElements() {
        super.setupUIElements();

        this.scaleContainer = div();
        this.renderer = new ClipRenderer({director: this.element.director, videoProperties: {playsInline: true}});
        this.timeline = new Timeline({director: this.element.director, renderer: this.renderer, initialize: true});
    }

    protected setupUILayout() {
        super.setupUILayout();

        this.element.addChild(this.scaleContainer);
        this.scaleContainer.addChild([this.renderer, this.timeline]);
        this.element.childHandler = this.scaleContainer;
    }

    protected setupUIListeners() {
        super.setupUIListeners();
        window.addEventListener("resize", () => this.resize());
    }

    public resize() {
        this.renderer.resize(this.model.aspectRatio);
    }
}