import {DefaultEventName, div, icon, p, Side, TurboDrawer, TurboEvent} from "turbodombuilder";
import {formatMMSS} from "../../../../utils/time";
import {Scrubber} from "../../scrubber/scrubber";
import {TimelineView} from "../timeline.view";
import {ClipTimeline} from "./clipTimeline";
import {ClipScrubber} from "../../scrubber/clipScrubber/clipScrubber";

export class ClipTimelineView extends TimelineView<ClipTimeline> {
    public drawer: TurboDrawer;
    public clipsContainer: HTMLDivElement;

    protected setupUIElements() {
        super.setupUIElements();

        this.drawer = new TurboDrawer({icon: "chevron", side: Side.right});

        this.clipsContainer = div({classes: "clips-container"});
        this.scrubber = new ClipScrubber({timeline: this.element, screenManager: this.element.screenManager, initialize: true});

        this.currentTimeText = p({style: "min-width: 3em"});
        this.totalDurationText = p({style: "min-width: 3em; text-align: right"});

        this.playButton = icon({
            icon: "play",
            classes: "play-button",
        });
    }

    protected setupUILayout() {
        this.element.addChild(this.drawer);
        this.element.childHandler = this.drawer.childHandler;
        super.setupUILayout();

        // this.clipsContainer.addChild(this.scrubber, 0);
        // this.element.addChild([
        //     this.clipsContainer,
        //     flexRowCenter({
        //         children: [
        //             this.currentTimeText,
        //             spacer(),
        //             this.playButton,
        //             spacer(),
        //             this.totalDurationText
        //         ]
        //     })
        // ]);
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