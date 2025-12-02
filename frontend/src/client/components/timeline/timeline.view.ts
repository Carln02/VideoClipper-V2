import {Timeline} from "./timeline";
import {TimelineModel} from "./timeline.model";
import {
    DefaultEventName,
    div,
    Direction,
    icon,
    p,
    spacer, TurboDragEvent,
    TurboEvent,
    TurboIcon,
    TurboView, effect, turbo, TurboObserver
} from "turbodombuilder";
import {formatMMSS} from "../../utils/time";
import {scrubber, Scrubber} from "../scrubber/scrubber";
import {SyncedClip} from "../clip/clip.types";
import {Clip} from "../clip/clip";
import {TimelineIndexInfo} from "./timeline.types";

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

    protected clipsObserver: TurboObserver<SyncedClip, Clip, number, number>;

    public onClipAdded: (syncedClip: SyncedClip, id: number, self, blockKey: number) => Clip = () => undefined;
    public onClipChanged: (syncedClip: SyncedClip, clip: Clip, id: number, self, blockKey: number) => void = () => {};

    public get clips(): Clip[] {
        return this.clipsObserver.getAllInstances();
    }

    protected setupUIElements() {
        super.setupUIElements();

        this.scrubberContainer = div({classes: "scrubber-container"});
        this.scrubber = scrubber({timeline: this.element, director: this.element.director});

        this.controlsContainer = div();
        this.currentTimeText = p({style: "min-width: 3em"});
        this.totalDurationText = p({style: "min-width: 3em; text-align: right"});

        this.playButton = icon({
            icon: "play",
            classes: "play-button",
        });
    }

    protected setupUILayout() {
        super.setupUILayout();

        turbo(this.controlsContainer).addChild([
            this.currentTimeText,
            spacer(),
            this.playButton,
            spacer(),
            this.totalDurationText
        ]);

        turbo(this.scrubberContainer).addChild(this.scrubber, 0);
        turbo(this).addChild([this.scrubberContainer, this.controlsContainer]);
    }

    protected setupUIListeners() {
        super.setupUIListeners();

        this.scrubber.onScrubbing = (e: TurboDragEvent) => this.emitter.fire("containerClicked", e);

        turbo(this.scrubberContainer).on(DefaultEventName.click, (e: TurboEvent) =>
            this.emitter.fire("containerClicked", e));

        turbo(this.playButton).on(DefaultEventName.click, (e: TurboEvent) => {
            this.emitter.fire("playButtonClicked", e);
            return true;
        });
    }

    protected setupChangedCallbacks() {
        this.clipsObserver = this.model.generateObserver({
            initialize: true,
            onAdded: this.onClipAdded,
        });

        this.clipsObserver.onUpdated.add(this.onClipChanged);
        this.clipsObserver.onDeleted.add(this.onClipChanged);

        super.setupChangedCallbacks();
    }

    public getClipAt(index: number): Clip {
        return this.clipsObserver.getInstanceAt(index);
    }

    public get currentClip() {
        return this.getClipAt(this.model.indexInfo?.clipIndex);
    }

    public get currentGhostingClip() {
        if (this.model.indexInfo?.ghostingIndex == null) return null;
        return this.getClipAt(this.model.indexInfo?.ghostingIndex);
    }

    public updatePlayButtonIcon(isPlaying: boolean) {
        this.playButton.icon = isPlaying ? "pause" : "play";
    }

    @effect private currentTimeChanged() {
        this.currentTimeText.textContent = formatMMSS(this.model.currentTime);
        this.scrubber.orientation == "vertical" ?
            this.scrubber.translation = this.model.currentTime / this.model.totalDuration * this.element.width
            : this.scrubber.translation = this.model.currentTime / this.model.totalDuration * this.element.height;
    }

    @effect private totalDurationChanged() {
        this.totalDurationText.textContent = formatMMSS(this.model.totalDuration);
        if (this.model.cards.length === 1) this.model.cards[0].duration = this.model.totalDuration;
    }

    @effect private orientationChanged() {
        this.scrubber.orientation = this.model.orientation === Direction.horizontal ? Direction.vertical : Direction.horizontal;
        this.clipsObserver.getAllInstances().forEach(component => component.orientation = this.model.orientation);
    }

    @effect private hasControlsChanged() {
        turbo(this.controlsContainer).setStyle("display", this.element.hasControls ? "" : "none");
    }

    public getClipIndexAtTimestamp(time: number = this.model.currentTime): TimelineIndexInfo {
        if (this.model.totalClipsCount <= 0) return;
        let index = 0, accumulatedTime = 0;

        while (index < this.model.totalClipsCount && accumulatedTime + this.getClipAt(index)?.duration < time) {
            accumulatedTime += this.getClipAt(index)?.duration;
            index++;
        }

        if (index == this.model.totalClipsCount) {
            index = this.model.totalClipsCount - 1;
            accumulatedTime -= this.getClipAt(index)?.duration;
        }

        const offset = time - accumulatedTime;
        const offsetToNext = this.getClipAt(index)?.duration - offset;
        const closestToNext = offsetToNext < offset;

        return {
            clipIndex: index,
            cardIndex: this.model.scopeKey(index).key,
            ghostingIndex: (index == 0 && !closestToNext)
                ? null
                : closestToNext ? index : index - 1,
            offset: offset,
            closestIntersection: closestToNext ? (index + 1) : index,
            distanceFromClosestIntersection: closestToNext ? offsetToNext : offset
        };
    }
}