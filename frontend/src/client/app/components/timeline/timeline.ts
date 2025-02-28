import {SyncedClip} from "../clip/clip.types";
import {define, TurboEvent} from "turbodombuilder";
import {ClipRenderer} from "../clipRenderer/clipRenderer";
import {Clip} from "../clip/clip";
import {Canvas} from "../../views/canvas/canvas";
import "./timeline.css";
import {Card} from "../card/card";
import {ClipTimelineEntry, TimelineProperties} from "./timeline.types";
import {YArray} from "../../../../yProxy";
import {TimelineView} from "./timeline.view";
import {TimelineModel} from "./timeline.model";
import {TurboDrawer} from "../drawer/drawer";
import {TimelinePlayHandler} from "./timeline.playHandler";
import {TimelineClipHandler} from "./timeline.clipHandler";
import {TimelineTimeHandler} from "./timeline.timeHandler";

@define("vc-timeline")
export class Timeline extends TurboDrawer<TimelineView, YArray<SyncedClip>, TimelineModel> {
    private readonly playHandler: TimelinePlayHandler;
    private readonly clipHandler: TimelineClipHandler;
    private readonly timeHandler: TimelineTimeHandler;

    public readonly renderer: ClipRenderer;

    private readonly _card: Card;

    constructor(properties: TimelineProperties) {
        super(properties);
        this.renderer = properties.renderer;
        this._card = properties.card;

        this.generateMvc(TimelineView, TimelineModel, properties.data);

        this.model.onClipAdded = (syncedClip, id) => {
            const clip = new Clip({timeline: this, data: syncedClip});
            this.view.clipsContainer.addChild(clip, id + 1);
            return clip;
        };

        this.model.onClipChanged = () => {
            this.reloadTime();
            this.reloadCurrentClip();
        };

        this.playHandler = new TimelinePlayHandler(this);
        this.clipHandler = new TimelineClipHandler(this);
        this.timeHandler = new TimelineTimeHandler(this, this.view);
    }

    public get card(): Card {
        return this._card;
    }

    public get clips(): Clip[] {
        return this.model.getAllClips();
    }

    public get pixelsPerSecondUnit(): number {
        return this.model.pixelsPerSecondUnit;
    }

    public get currentTime(): number {
        return this.timeHandler.currentTime;
    }

    public set currentTime(value: number) {
        this.timeHandler.currentTime = value;
    }

    public get totalDuration(): number {
        return this.timeHandler.totalDuration;
    }

    public set totalDuration(value: number) {
        this.timeHandler.totalDuration = value;
    }

    public get currentClip() {
        return this.clipHandler.currentClip;
    }

    public get width() {
        return this.totalDuration * this.pixelsPerSecondUnit * (Canvas.instance.scale || 1);
    }

    public reloadTime() {
        this.timeHandler.reloadTime();
    }

    public getClipAtIndex(index: number) {
        return this.model.getClipAt(index);
    }

    public reFetchCurrentClip() {
        this.clipHandler.reFetchCurrentClip();
    }

    public reloadCurrentClip(force: boolean = false) {
        this.clipHandler.reloadCurrentClip(force);
    }

    public isPlaying(): boolean {
        return this.playHandler.isPlaying();
    }

    public async addClip(clip: SyncedClip, index?: number) {
        return this.model.addClip(clip, index);
    }

    public removeClip(position: number) {
        this.model.removeClip(position);
    }

    public snapToClosest(entry: number | ClipTimelineEntry = this.currentClip) {
        this.clipHandler.snapToClosest(entry);
    }

    public snapAtEnd() {
        this.snapToClosest(this.data.length);
    }

    public getTimeFromPosition(e: TurboEvent): number {
        return this.timeHandler.getTimeFromPosition(e);
    }

    public getClipAt(time: number = this.currentTime): ClipTimelineEntry {
        return this.clipHandler.getClipAtTimestamp(time);
    }

    public async play(play: boolean = !this.isPlaying()) {
        this.view.updatePlayButtonIcon(play);
        return this.playHandler.play(play);
    }
}
