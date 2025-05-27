import {ClipProperties, SyncedClip} from "../clip/clip.types";
import {auto, define, TurboEvent} from "turbodombuilder";
import {ClipRenderer} from "../clipRenderer/clipRenderer";
import {Clip} from "../clip/clip";
import "./timeline.css";
import {Card} from "../card/card";
import {TimelineIndexInfo, TimelineProperties} from "./timeline.types";
import {TimelineView} from "./timeline.view";
import {TimelineModel} from "./timeline.model";
import {TimelinePlayController} from "./timeline.playController";
import {TimelineClipController} from "./timeline.clipController";
import {TimelineTimeController} from "./timeline.timeController";
import {TimelineClipHandler} from "./timeline.clipHandler";
import {TimelineTimeHandler} from "./timeline.timeHandler";
import {YArray, YMap} from "../../../yManagement/yManagement.types";
import {VcComponent} from "../component/component";
import {Project} from "../../screens/project/project";

@define("vc-timeline")
export class Timeline<
    View extends TimelineView = TimelineView<any, any>
> extends VcComponent<View, YArray<SyncedClip>, TimelineModel, Project> {
    public readonly renderer: ClipRenderer;

    public constructor(properties: TimelineProperties<View>) {
        super(properties);
        this.addClass("vc-timeline");
        this.screenManager = properties.screenManager;
        this.renderer = properties.renderer;

        this.mvc.generate({
            ...properties,
            viewConstructor: properties.viewConstructor ?? TimelineView as unknown as new () => View,
            modelConstructor: TimelineModel,
            controllerConstructors: [TimelinePlayController, TimelineClipController, TimelineTimeController],
            handlerConstructors: [TimelineClipHandler, TimelineTimeHandler],
            data: properties.data,
            initialize: false
        });

        this.model.onCardAdded = (cardId) => this.screenManager.getNode(cardId) as Card;
        this.model.onClipAdded = (syncedClip, id, blockKey) => this.onClipAdded(syncedClip, id, blockKey);
        this.model.onClipChanged = () => this.reloadTime();

        this.mvc.initialize();
        this.scaled = properties.scaled ?? false;
        this.card = properties.card;
    }

    protected onClipAdded(syncedClip: SyncedClip, id: number, blockKey: number, clipProperties: ClipProperties = {}): Clip {
        const clip = new Clip({...clipProperties, timeline: this, screenManager: this.screenManager});
        const snapToNext = id === this.model.indexInfo?.closestIntersection;

        clip.onMediaDataChanged = (clip: Clip) => {
            if (clip != this.model.currentClip) return;
            this.renderer.setFrame(clip, this.model.indexInfo?.offset);
        };

        requestAnimationFrame(() => {
            clip.data = syncedClip;
            if (snapToNext) this.snapToClosest(id + 1);
            if (clip != this.model.currentClip) this.renderer.setFrame(clip, this.model.indexInfo?.offset);
        });

        return clip;
    }

    protected get timeController(): TimelineTimeController {
        return this.mvc.getController("time") as TimelineTimeController;
    }

    protected get clipController(): TimelineClipController {
        return this.mvc.getController("clip") as TimelineClipController;
    }

    @auto()
    public set hasControls(value: boolean) {
        this.view.hasControls = value;
    }

    @auto()
    public set scaled(value: boolean) {
        if (this.view && this.view.scrubber) this.view.scrubber.scaled = value;
    }

    public get card(): Card {
        //TODO
        return this.model.getCardAt(this.model.indexInfo?.cardIndex || 0);
    }

    public set card(card: Card) {
        this.model.cards = [card];
        this.onCardsChanged();
        if (card) card.duration = this.model.totalDuration;
    }

    public set cardIds(value: YArray<string>) {
        this.model.cardIds = value;
        this.onCardsChanged();
    }

    protected onCardsChanged() {
        if (!this.card) return;
        const selectedClip = this.screenManager.contextManager.getContext(2);
        if (selectedClip && selectedClip[0] instanceof Clip) this.clipController.snapToClosest();
        else this.clipController.snapAtEnd();
        this.clipController.reloadCurrentClip();
    }

    public get clips(): Clip[] {
        return this.model.getAllComponents();
    }

    public get currentClipInfo(): TimelineIndexInfo {
        return this.model.indexInfo;
    }

    public get currentClip(): Clip {
        return this.model.currentClip;
    }

    public get pixelsPerSecondUnit(): number {
        return this.model.pixelsPerSecondUnit;
    }

    public get isPlaying(): boolean {
        return this.renderer.isPlaying;
    }

    public get width() {
        return this.offsetWidth;
    }

    public async addClip(clip: SyncedClip & YMap, index?: number): Promise<number> {
        return this.model.clipHandler.addClip(clip, index);
    }

    public removeClip(clip: Clip) {
        return this.model.clipHandler.removeClip(clip)
    }

    public removeClipAt(position: number) {
        return this.model.clipHandler.removeClipAt(position);
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
       return this.model.clipHandler.getClipIndexAtTimestamp(this.timeController.getTimeFromPosition(e));
    }

    public async splitClipAt(time: number = this.model.currentTime) {
        const info = this.model.clipHandler.getClipIndexAtTimestamp(time);
        const clip = this.model.clipHandler.getClipAt(info.clipIndex);
        await this.model.clipHandler.addClip(clip.split(clip.startTime + info.offset), info.clipIndex + 1);
    }

    public addIndicatorAt(indicator: Element, index: number) {
        indicator.remove();
        this.view.scrubberContainer.addChild(indicator, index);
    }
}