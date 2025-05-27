import {Timeline} from "./timeline";
import {TimelineModel} from "./timeline.model";
import {
    auto,
    DefaultEventName,
    div,
    flexRowCenter,
    icon,
    p,
    spacer,
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
        this.emitter.fire("totalDurationChanged");
    }

    @auto()
    public set hasControls(value: boolean) {
        this.controlsContainer.setStyle("display", value ? "" : "none");
    }

    protected setupUIElements() {
        super.setupUIElements();

        this.scrubberContainer = div({classes: "scrubber-container"});
        this.scrubber = new Scrubber({timeline: this.element, screenManager: this.element.screenManager, initialize: true});

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

        this.scrubberContainer.addEventListener(DefaultEventName.click, (e: TurboEvent) =>
            this.emitter.fire("containerClicked", e));

        this.playButton.addListener(DefaultEventName.click, (e: TurboEvent) => {
                e.stopImmediatePropagation();
                this.emitter.fire("playButtonClicked", e);
        });
    }

    protected setupChangedCallbacks() {
        super.setupChangedCallbacks();

        this.emitter.add("currentTimeChanged", () => {
            this.currentTimeText.textContent = formatMMSS(this.model.currentTime);
            this.scrubber.translation = this.model.currentTime / this.model.totalDuration * this.element.width;
        });

        this.emitter.add("totalDurationChanged", () => {
            this.totalDurationText.textContent = formatMMSS(this.model.totalDuration);
        });
    }

    public updatePlayButtonIcon(isPlaying: boolean) {
        this.playButton.icon = isPlaying ? "pause" : "play";
    }
}