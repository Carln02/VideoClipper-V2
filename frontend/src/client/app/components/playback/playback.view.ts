import {Open, Side, TurboView} from "turbodombuilder";
import {Playback} from "./playback";
import {PlaybackModel} from "./playback.model";
import {Timeline} from "../timeline/timeline";
import {ClipRenderer} from "../clipRenderer/clipRenderer";

export class PlaybackView extends TurboView<Playback, PlaybackModel> {
    public renderer: ClipRenderer;
    public timeline: Timeline;

    initialize() {
        super.initialize();
        this.resize();
    }

    protected setupUIElements() {
        super.setupUIElements();

        this.renderer = new ClipRenderer({screenManager: this.element.screenManager, videoProperties: {playsInline: true}});

        this.timeline = new Timeline({
            screenManager: this.element.screenManager,
            card: null,
            scaled: false,
            renderer: this.renderer,
            side: Side.top,
            icon: "chevron",
            offset: {[Open.open]: -4},
            initiallyOpen: true
        });
    }

    protected setupUILayout() {
        super.setupUILayout();

        this.element.addChild([this.renderer, this.timeline]);
    }

    protected setupUIListeners() {
        super.setupUIListeners();
        window.addEventListener("resize", () => this.resize());
    }

    public resize() {
        this.renderer.resize(this.model.aspectRatio);
    }
}