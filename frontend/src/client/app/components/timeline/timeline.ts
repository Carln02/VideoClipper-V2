import {SyncedClip} from "../clip/clip.types";
import {auto, define, trim, TurboEvent} from "turbodombuilder";
import {ClipRenderer} from "../clipRenderer/clipRenderer";
import {Clip} from "../clip/clip";
import {Canvas} from "../../views/canvas/canvas";
import "./timeline.css";
import {Card} from "../card/card";
import {ClipRendererVisibility} from "../clipRenderer/clipRenderer.types";
import {ContextManager} from "../../managers/contextManager/contextManager";
import {ClipTimelineEntry, TimelineProperties} from "./timeline.types";
import {randomColor} from "../../../utils/random";
import {YArray} from "../../../../yProxy";
import {YUtilities} from "../../../../yManagement/yUtilities";
import {TimelineView} from "./timeline.view";
import {TimelineModel} from "./timeline.model";
import {TurboDrawer} from "../drawer/drawer";

@define("vc-timeline")
export class Timeline extends TurboDrawer<TimelineView, YArray<SyncedClip>, TimelineModel> {
    public readonly pixelsPerSecondUnit: number = 20 as const;

    public readonly clips: Clip[] = [];

    public readonly renderer: ClipRenderer;

    private playTimer: NodeJS.Timeout | null = null;
    private nextTimer: NodeJS.Timeout | null = null;

    private readonly _card: Card;
    private _currentClip: ClipTimelineEntry;
    private _currentTime: number = 0;

    constructor(properties: TimelineProperties) {
        super(properties);

        this.renderer = properties.renderer;
        this._card = properties.card;

        this.generateMvc(TimelineView, TimelineModel, properties.data, false);

        this.model.onClipAdded = (syncedClip, id) => {
            const clip = new Clip({timeline: this, data: syncedClip});
            this.view.clipsContainer.addChild(clip, id);
            return clip;
        };

        this.model.onClipChanged = () => {
            this.reloadTime();
            this.reloadCurrentClip();
        };

        requestAnimationFrame(() => this.initializeMvc())

    }

    public get card(): Card {
        return this._card;
    }

    public get currentTime(): number {
        return this._currentTime;
    }

    public set currentTime(value: number) {
        this._currentTime = trim(value, this.totalDuration);
        this.view.scrubber.translation = this._currentTime / this.totalDuration * this.width;
        this.currentClip = this.getClipAt();
        this.view.updateCurrentTime(this._currentTime);
    }

    @auto()
    public set totalDuration(value: number) {
        this.card.duration = value;
        this.view.updateTotalDuration(value);
    }

    public get currentClip() {
        return this._currentClip;
    }

    private set currentClip(value: ClipTimelineEntry) {
        this._currentClip = value;
    }

    public get width() {
        return this.totalDuration * this.pixelsPerSecondUnit * (Canvas.instance.scale || 1);
    }

    public reloadTime() {
        this.totalDuration = this.model.getAllClips().reduce((sum, clip) => sum + clip.duration, 0);
        this.currentTime = (this.view.scrubber.translation / this.width * this.totalDuration) || 0;
        this.refresh();
    }

    public reloadCurrentClip(force: boolean = false) {
        this.play(false);
        ContextManager.instance.setContext(this.currentClip.clip, 2);
        if (!this.renderer || this.renderer.visibilityMode == ClipRendererVisibility.ghosting) return;
        this.renderer.setFrame(this.currentClip.clip, this.currentClip.offset, force);
    }

    public isPlaying(): boolean {
        return this.playTimer != null;
    }

    public async addClip(clip: SyncedClip, index?: number) {
        if ((!index && index != 0) || index > this.data.length) index = this.data.length;
        if (!clip.color) clip.color = randomColor();
        YUtilities.addInYArray(clip, this.data, index);
    }

    public removeClip(position: number) {
        if (!position && position != 0) return;
        this.data.delete(position);
    }

    public snapToClosest(entry: number | ClipTimelineEntry = this.currentClip) {
        let index = typeof entry == "number" ? entry : entry.closestIntersection;
        if (index > this.data.length) index = this.data.length;

        let currentTime = 0;
        for (let i = 0; i < index; i++) currentTime += this.getDuration(i);
        this.currentTime = currentTime;

        this.renderer.setFrame(this.model.getClipAt(index <= 0 ? index : (index - 1)));
    }

    public snapAtEnd() {
        this.snapToClosest(this.data.length);
    }

    public getTimeFromPosition(e: TurboEvent) {
        let offsetPosition = e.position.x - this.view.clipsContainer.getBoundingClientRect().left;
        if (offsetPosition < 0) offsetPosition = 0;
        if (offsetPosition > this.width) offsetPosition = this.width;
        return offsetPosition / this.width * this.totalDuration;
    }

    public getClipAt(time: number = this.currentTime): ClipTimelineEntry {
        if (!this.data || !this.data.length) return;
        let index = 0, accumulatedTime = 0;

        while (index < this.data.length && accumulatedTime + this.getDuration(index) < time) {
            accumulatedTime += this.getDuration(index);
            index++;
        }

        if (index == this.data.length) {
            index = this.data.length - 1;
            accumulatedTime -= this.getDuration(index);
        }

        const clip = this.model.getClipAt(index);
        const offset = time - accumulatedTime;
        const closestIntersection = accumulatedTime < clip.duration / 2 ? index : (index + 1);

        return {
            clip: clip, offset: offset, index: index, closestIntersection: closestIntersection,
            distanceFromClosestIntersection: closestIntersection == index ? offset : clip.duration - offset
        };
    }

    private async playNext(index: number, offset = 0) {
        if (index >= this.model.getSize()) {
            this.play(false);
            return;
        }

        await this.renderer.setFrame(this.model.getClipAt(index), offset);
        this.renderer.playNext();


        this.renderer.loadNext(this.model.getClipAt(index + 1));

        this.nextTimer = setTimeout(() => this.playNext(index + 1),
            1000 * (this.getDuration(index) - offset));
    }

    public async play(play: boolean = !this.isPlaying()) {
        this.view.updatePlayButtonIcon(play);

        if (this.nextTimer) clearTimeout(this.nextTimer);
        this.nextTimer = null;

        if (this.playTimer) clearInterval(this.playTimer);
        this.playTimer = null;

        if (!play) {
            this.renderer.pause();
            return;
        }

        if (this.currentTime >= this.totalDuration - 0.1) this.currentTime = 0;

        this.playTimer = setInterval(() => {
            this.currentTime += 0.01;
            if (this.currentTime >= this.totalDuration) clearInterval(this.playTimer);
        }, 10);

        this.renderer.loadNext(this.currentClip.clip, this.currentClip.offset);

        this.playNext(this.currentClip.index, this.currentClip.offset);
    }

    private getDuration(index: number) {
        return this.model.getClipAt(index)?.duration || 0;
    }
}
