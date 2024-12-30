import {SyncedClip} from "../clip/clip.types";
import {
    auto,
    DefaultEventName,
    define,
    div,
    flexRowCenter,
    icon,
    p,
    spacer,
    trim,
    TurboEvent,
    TurboIcon
} from "turbodombuilder";
import {ClipRenderer} from "../clipRenderer/clipRenderer";
import {Clip} from "../clip/clip";
import {Scrubber} from "./components/scrubber/scrubber";
import {formatMMSS} from "../../../utils/time";
import {ToolManager} from "../../managers/toolManager/toolManager";
import {Canvas} from "../../views/canvas/canvas";
import "./timeline.css";
import {ToolType} from "../../managers/toolManager/toolManager.types";
import {Card} from "../card/card";
import {ClipRendererVisibility} from "../clipRenderer/clipRenderer.types";
import {ContextManager} from "../../managers/contextManager/contextManager";
import {ClipTimelineEntry} from "./timeline.types";
import {PanelThumb} from "../basicComponents/panelThumb/panelThumb";
import {Direction, PanelThumbProperties} from "../basicComponents/panelThumb/panelThumb.types";
import {randomColor} from "../../../utils/random";
import {YArray} from "../../../../yProxy";
import {YArrayManager} from "../../yjsManagement/yArrayManager";
import {YComponent} from "../../yjsManagement/yComponent";
import {YUtilities} from "../../yjsManagement/yUtilities";

@define("vc-timeline")
export class Timeline extends YComponent<YArray<SyncedClip>, YArray> {
    public readonly pixelsPerSecondUnit: number = 20 as const;

    private readonly clipsManager: YArrayManager<SyncedClip, Clip>;

    public readonly clips: Clip[] = [];

    public readonly renderer: ClipRenderer;

    private playTimer: NodeJS.Timeout | null = null;
    private nextTimer: NodeJS.Timeout | null = null;

    private _card: Card;
    private _currentClip: ClipTimelineEntry;

    private thumb: PanelThumb;

    public clipsContainer: HTMLDivElement;
    private scrubber: Scrubber;

    private currentTimeText: HTMLParagraphElement;
    private totalDurationText: HTMLParagraphElement;
    private playButton: TurboIcon;

    constructor(data: YArray<SyncedClip>, card: Card, renderer: ClipRenderer, properties: PanelThumbProperties = {}) {
        super(properties);
        this.renderer = renderer;
        this._card = card;

        this.initUI(properties);
        this.initEvents();

        this.clipsManager = new YArrayManager();
        this.clipsManager.onAdded = (syncedClip, id) => {
            const clip = new Clip(this, syncedClip);
            this.clipsContainer.addChild(clip, id);
            return clip;
        };

        const oldUpdated = this.clipsManager.onUpdated;
        this.clipsManager.onUpdated = (syncedClip, clip, id, blockKey) => {
            oldUpdated(syncedClip, clip, id, blockKey);
            // this.reloadTime();
            // this.reloadCurrentClip();
        };

        const oldDeleted = this.clipsManager.onDeleted;
        this.clipsManager.onDeleted = (syncedClip, clip, id, blockKey) => {
            oldDeleted(syncedClip, clip, id, blockKey);
            this.reloadTime();
            this.reloadCurrentClip();
        };

        this.clipsManager.data = data;
    }

    public set data(value: YArray<SyncedClip>) {
        this.clipsManager.data = value;
    }

    public get data(): YArray<SyncedClip> {
        return this.clipsManager.data;
    }

    protected setupCallbacks() {
        // this.data.bind(YProxyEventName.entryChanged, (newValue: SyncedClip, oldValue: SyncedClip, _isLocal, path: YPath) => {
        //     if (!newValue && !oldValue) return;
        //
        //     const key = path[path.length - 1];
        //     const index = typeof key == "number" ? key : Number.parseInt(key);
        //
        //     if (!newValue) {
        //         this.clips[index]?.destroy();
        //         this.clips.splice(index, 1);
        //     } else if (!oldValue) {
        //         const clip = new Clip(this.card);
        //         this.clipsContainer.addChild(clip, index);
        //         this.clips.splice(index, 0, clip);
        //         clip.data = newValue;
        //     } else {
        //         const clip: Clip = this.clips[index];
        //         if (clip) clip.data = newValue;
        //     }
        //
        //     this.reloadTime();
        //     this.reloadCurrentClip();
        // }, this, true);
    }

    private initUI(properties: PanelThumbProperties) {
        this.clipsContainer = div({classes: "clips-container", parent: this});
        this.scrubber = new Scrubber(this, {parent: this.clipsContainer});

        this.thumb = new PanelThumb({
            direction: properties.direction,
            fitSizeOf: properties.fitSizeOf,
            initiallyClosed: properties.initiallyClosed,
            closedOffset: properties.closedOffset,
            openOffset: properties.openOffset,
            invertOpenAndClosedValues: properties.invertOpenAndClosedValues,
            panel: this,
            parent: this
        });
        this.direction = properties.direction;

        this.currentTimeText = p({style: "min-width: 3em"});
        this.totalDurationText = p({style: "min-width: 3em; text-align: right"});

        this.playButton = icon({
            icon: "play",
            classes: "play-button",
            listeners: {
                [DefaultEventName.click]: (e: TurboEvent) => {
                    e.stopImmediatePropagation();
                    this.play();
                }
            }
        });

        this.addChild(flexRowCenter({
            children: [this.currentTimeText, spacer(), this.playButton, spacer(), this.totalDurationText]
        }));
    }

    private initEvents() {
        this.clipsContainer.addEventListener(DefaultEventName.click, (e: TurboEvent) => {
            this.currentTime = this.getTimeFromPosition(e);
            if (ToolManager.instance.getFiredTool(e).name == ToolType.shoot) this.snapToClosest();
            this.reloadCurrentClip();
        });
    }

    public get card(): Card {
        return this._card;
    }

    public get direction() {
        return this.thumb.direction;
    }

    public set direction(value: Direction) {
        this.thumb.direction = value;
        this.toggleClass("right-timeline", value == Direction.right);
        this.toggleClass("top-timeline", value == Direction.top);
    }

    @auto({
        callBefore: function (value) {
            return trim(value, this.totalDuration);
        }
    })
    public set currentTime(value: number) {
        this.currentTimeText.textContent = formatMMSS(value);
        this.scrubber.translation = value / this.totalDuration * this.width;
        this.currentClip = this.getClipAt();
    }

    @auto()
    public set totalDuration(value: number) {
        this.totalDurationText.textContent = formatMMSS(value);
        this.card.duration = value;
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
        this.totalDuration = this.clipsManager.getAllComponents().reduce((sum, clip) => sum + clip.duration, 0);
        this.currentTime = (this.scrubber.translation / this.width * this.totalDuration) || 0;
        this.thumb.open = this.thumb.open;
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

        this.renderer.setFrame(this.clipsManager.getInstance(index <= 0 ? index : (index - 1)));
    }

    public snapAtEnd() {
        this.snapToClosest(this.data.length);
    }

    public getTimeFromPosition(e: TurboEvent) {
        let offsetPosition = e.position.x - this.clipsContainer.getBoundingClientRect().left;
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

        console.log(this.clipsManager.data)
        const clip = this.clipsManager.getInstance(index);
        const offset = time - accumulatedTime;
        const closestIntersection = accumulatedTime < clip.duration / 2 ? index : (index + 1);

        return {
            clip: clip, offset: offset, index: index, closestIntersection: closestIntersection,
            distanceFromClosestIntersection: closestIntersection == index ? offset : clip.duration - offset
        };
    }

    private async playNext(index: number, offset = 0) {
        if (index >= this.clipsManager.getAllData().length) {
            this.play(false);
            return;
        }

        await this.renderer.setFrame(this.clipsManager.getInstance(index), offset);
        this.renderer.playNext();


        this.renderer.loadNext(this.clipsManager.getInstance(index + 1));

        this.nextTimer = setTimeout(() => this.playNext(index + 1),
            1000 * (this.getDuration(index) - offset));
    }

    public async play(play: boolean = !this.isPlaying()) {
        this.playButton.icon = play ? "pause" : "play";

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
        return this.clipsManager.getInstance(index)?.duration || 0;
    }
}
