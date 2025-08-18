import {Timeline} from "./timeline";
import {TimelineModel} from "./timeline.model";
import {
    auto,
    DefaultEventName,
    div,
    Direction,
    flexRowCenter,
    icon,
    p,
    spacer, TurboDragEvent,
    TurboEvent,
    TurboIcon,
    TurboView
} from "turbodombuilder";
import {formatMMSS} from "../../utils/time";
import {Scrubber} from "../scrubber/scrubber";

export class TimelineView<
    Element extends Timeline = Timeline,
    Model extends TimelineModel = TimelineModel
> extends TurboView<Element, Model> {
    public scrubberContainer: HTMLDivElement;
    public scrubber: Scrubber;

    protected controlsContainer: HTMLElement;
    protected currentTimeText: HTMLParagraphElement;
    protected totalDurationText: HTMLParagraphElement;
    protected playButton: TurboIcon;

    public initialize() {
        super.initialize();
         this.scrubber.orientation = this.model.orientation === Direction.horizontal ? Direction.vertical : Direction.horizontal;
        this.emitter.fire("totalDurationChanged");
    }

    @auto()
    public set hasControls(value: boolean) {
        this.controlsContainer.setStyle("display", value ? "" : "none");
    }

    protected setupUIElements() {
        super.setupUIElements();

        this.scrubberContainer = div({classes: "scrubber-container"});
        this.scrubber = new Scrubber({timeline: this.element, director: this.element.director, initialize: true});

        this.controlsContainer = flexRowCenter();
        this.currentTimeText = p({style: "min-width: 3em"});
        this.totalDurationText = p({style: "min-width: 3em; text-align: right"});

        this.playButton = icon({
            icon: "play",
            classes: "play-button",
        });
    }

    protected setupUILayout() {
        super.setupUILayout();

        this.controlsContainer.addChild([
            this.currentTimeText,
            spacer(),
            this.playButton,
            spacer(),
            this.totalDurationText
        ]);

        this.scrubberContainer.addChild(this.scrubber, 0);
        this.element.addChild([this.scrubberContainer, this.controlsContainer]);
    }

    protected setupUIListeners() {
        super.setupUIListeners();

        this.scrubber.onScrubbing = (e: TurboDragEvent) => this.emitter.fire("containerClicked", e);

        this.scrubberContainer.addListener(DefaultEventName.click, (e: TurboEvent) =>
            this.emitter.fire("containerClicked", e), this.scrubberContainer, {propagate: true});

        this.playButton.addListener(DefaultEventName.click, (e: TurboEvent) => {
                e.stopImmediatePropagation();
                this.emitter.fire("playButtonClicked", e);
        });
    }

    protected setupChangedCallbacks() {
        super.setupChangedCallbacks();

        this.emitter.add("currentTimeChanged", () => {
            this.currentTimeText.textContent = formatMMSS(this.model.currentTime);
            //TODO NOT THE BEST FIX
            requestAnimationFrame(() => this.scrubber.translation = this.model.currentTime / this.model.totalDuration * this.element.width);
            this.scrubber.orientation == "vertical" ?
                this.scrubber.translation = this.model.currentTime / this.model.totalDuration * this.element.width
                : this.scrubber.translation = this.model.currentTime / this.model.totalDuration * this.element.height;
                //does not work lmao

        });

        this.emitter.add("totalDurationChanged", () => {
            this.totalDurationText.textContent = formatMMSS(this.model.totalDuration);
        });

        this.emitter.add("orientationChanged", (value: Direction) => {
            this.scrubber.orientation = value === Direction.horizontal ? Direction.vertical : Direction.horizontal;
        });
    }

    public updatePlayButtonIcon(isPlaying: boolean) {
        this.playButton.icon = isPlaying ? "pause" : "play";
    }
}