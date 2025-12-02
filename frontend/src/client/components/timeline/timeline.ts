import {ClipProperties, SyncedClip} from "../clip/clip.types";
import {define, TurboEvent, Direction, YArray, YMap, controller, turbo, element, expose, signal} from "turbodombuilder";
import {ClipRenderer} from "../clipRenderer/clipRenderer";
import {clip, Clip} from "../clip/clip";
import "./timeline.css";
import {Card} from "../card/card";
import {TimelineIndexInfo, TimelineProperties} from "./timeline.types";
import {TimelineView} from "./timeline.view";
import {TimelineModel} from "./timeline.model";
import {TimelinePlayController} from "./timeline.playController";
import {TimelineClipController} from "./timeline.clipController";
import {TimelineTimeController} from "./timeline.timeController";
import {TimelineTimeHandler} from "./timeline.timeHandler";
import {VcComponent} from "../component/component";
import {Project} from "../../directors/project/project";

@define("vc-timeline")
export class Timeline<
    View extends TimelineView = TimelineView<any, any>
> extends VcComponent<View, YArray<SyncedClip>, TimelineModel, Project> {
    public renderer: ClipRenderer;

    @controller() protected timeController: TimelineTimeController;
    @controller() protected clipController: TimelineClipController;
    @controller() protected playController: TimelinePlayController;

    @signal public hasControls: boolean = false;

    @expose("model") public accessor orientation: Direction;
    @expose("model", false) public accessor currentClip: Clip;
    @expose("model", false) public accessor pixelsPerSecondUnit: number;

    @expose("view", false) public accessor clips: Clip[];
    @expose("view.scrubber") public accessor scaled: boolean;
    @expose("renderer", false) public accessor isPlaying: boolean;

    public onPlay: (play: boolean) => void = () => {};

    public initialize(): void {
        super.initialize();
        this.model.onCardAdded = (cardId) => this.director.getNode(cardId) as Card;
        this.view.onClipAdded = (syncedClip, id, self, blockKey) => this.onClipAdded(syncedClip, id, self, blockKey);
        this.view.onClipChanged = () => this.reloadTime();
    }

    protected onClipAdded(_data: SyncedClip, id: number, _self, _bk: number, clipProperties: ClipProperties = {}): Clip {
        const clipEl = clip({
            ...clipProperties,
            timeline: this,
            director: this.director
        });

        clipEl.orientation = this.orientation;
        clipEl.onMediaDataChanged = (clip: Clip) => {
            if (clip != this.view.currentClip) return;
            this.clipController.reloadCurrentClip();
        };

        if (id === this.model.indexInfo?.closestIntersection && this.model.indexInfo?.closestIntersection > 0)
            requestAnimationFrame(() => this.snapToClosest(id + 1));

        return clipEl;
    }

    public get card(): Card {
        return this.model.getCardAt(this.model.indexInfo?.cardIndex || 0);
    }

    public set card(card: Card) {
        this.model.cards = card ? [card] : [];
        this.onCardsChanged();
        if (card) card.duration = this.model.totalDuration;
    }

    public set cardIds(value: YArray<string>) {
        this.model.cardIds = value;
        this.onCardsChanged();
    }

    protected onCardsChanged() {
        if (!this.card) return;
        const selectedClip = this.director.contextManager.getContext(2);
        if (selectedClip && selectedClip[0] instanceof Clip) this.clipController.snapToClosest();
        else requestAnimationFrame(() => this.clipController.snapAtEnd());
    }

    public get currentClipInfo(): TimelineIndexInfo {
        return this.model.indexInfo;
    }

    public get width() {
        const basis = this.scaled ? this.director.canvas.scale : 1;
        return this.offsetWidth * basis;
    }

    public get height() {
        const basis = this.scaled ? this.director.canvas.scale : 1;
        return this.offsetHeight * basis;
    }

    public addClip(clip: SyncedClip & YMap, index?: number): number {
        return this.model.addDataAt(clip, index) as number;
    }

    public removeClip(clip: Clip) {
        return this.removeClipAt(this.view.clips.indexOf(clip));
    }

    public removeClipAt(position: number) {
        return this.model.deleteDataAt(position);
    }

    public snapToClosest(entry: number | TimelineIndexInfo = this.model.indexInfo) {
        this.clipController.snapToClosest(entry);
    }

    public snapAtEnd() {
        this.snapToClosest(this.dataSize);
    }

    public reloadTime() {
        this.timeController.reloadTime();
    }

    public getClipFromPosition(e: TurboEvent) {
       return this.view.getClipIndexAtTimestamp(this.timeController.getTimeFromPosition(e));
    }

    public splitClipAt(time: number = this.model.currentTime) {
        const info = this.view.getClipIndexAtTimestamp(time);
        const clip: Clip = this.view.getClipAt(info.clipIndex);
        if (!clip) return;
        return this.model.addDataAt(clip.split(clip.startTime + info.offset), info.clipIndex + 1);
    }

    public addIndicatorAt(indicator: Element, index: number) {
        indicator.remove();
        turbo(this.view.scrubberContainer).addChild(indicator, index);
    }

    public async play(startTime: number = this.model.currentTime) {
        this.model.currentTime = startTime;
        await this.playController.play(true);
    }
}

export function timeline<View extends TimelineView = TimelineView<any, any>>(properties: TimelineProperties<View>): Timeline<View> {
    turbo(properties).applyDefaults({
        tag: "vc-timeline",
        view: TimelineView as new () => View,
        model: TimelineModel,
        controllers: [TimelinePlayController, TimelineClipController, TimelineTimeController],
        handlers: [TimelineTimeHandler],
        orientation: Direction.horizontal,
        scaled: false,
        hasControls: true,
    });
    return element({...properties}) as Timeline<View>;
}