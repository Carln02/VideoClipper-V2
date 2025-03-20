import {Timeline} from "./timeline";
import {TimelineModel} from "./timeline.model";
import {DefaultEventName, div, flexRowCenter, icon, p, spacer, TurboEvent, TurboIcon, TurboView} from "turbodombuilder";
import {formatMMSS} from "../../../utils/time";
import {Scrubber} from "../scrubber/scrubber";

export class TimelineView extends TurboView<Timeline, TimelineModel> {
    public clipsContainer: HTMLDivElement;
    public scrubber: Scrubber;

    private currentTimeText: HTMLParagraphElement;
    private totalDurationText: HTMLParagraphElement;
    private playButton: TurboIcon;

    protected setupUIElements() {
        super.setupUIElements();

        this.clipsContainer = div({classes: "clips-container"});
        this.scrubber = new Scrubber(this.element, {parent: this.clipsContainer});

        this.currentTimeText = p({style: "min-width: 3em"});
        this.totalDurationText = p({style: "min-width: 3em; text-align: right"});

        this.playButton = icon({
            icon: "play",
            classes: "play-button",
        });
    }

    protected setupUILayout() {
        super.setupUILayout();

        this.clipsContainer.addChild(this.scrubber, 0);
        this.element.addChild([
            this.clipsContainer,
            flexRowCenter({
                children: [
                    this.currentTimeText,
                    spacer(),
                    this.playButton,
                    spacer(),
                    this.totalDurationText
                ]
            })
        ]);
    }

    protected setupUIListeners() {
        super.setupUIListeners();

        this.clipsContainer.addEventListener(DefaultEventName.click, (e: TurboEvent) =>
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
        });

        this.emitter.add("totalDurationChanged", () => {
            this.totalDurationText.textContent = formatMMSS(this.model.totalDuration);
        });
    }

    public updatePlayButtonIcon(isPlaying: boolean) {
        this.playButton.icon = isPlaying ? "pause" : "play";
    }
}