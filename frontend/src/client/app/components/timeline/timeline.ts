import {SyncedClip} from "../clip/clip.types";
import {auto, define, TurboDrawer, TurboEvent} from "turbodombuilder";
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
import {YArray, YMap} from "../../../../yManagement/yManagement.types";
import {DocumentManager} from "../../managers/documentManager/documentManager";
import {YUtilities} from "../../../../yManagement/yUtilities";

@define("vc-timeline")
export class Timeline extends TurboDrawer<TimelineView, YArray<SyncedClip>, TimelineModel> {
    public screenManager: DocumentManager;
    public readonly renderer: ClipRenderer;

    public constructor(properties: TimelineProperties) {
        super(properties);
        this.screenManager = properties.screenManager;
        this.renderer = properties.renderer;

        this.mvc.generate({
            viewConstructor: TimelineView,
            modelConstructor: TimelineModel,
            controllerConstructors: [TimelinePlayController, TimelineClipController, TimelineTimeController],
            handlerConstructors: [TimelineClipHandler, TimelineTimeHandler],
            data: properties.data,
            initialize: false
        });

        this.model.onClipAdded = (syncedClip, id) => {
            const clip = new Clip({timeline: this, screenManager: this.screenManager});
            const snapToNext = id === this.model.indexInfo?.closestIntersection;
            this.view.clipsContainer.addChild(clip, id + 1);

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
        };

        this.model.onClipChanged = () => this.timeController.reloadTime();

        this.mvc.initialize();
        this.card = properties.card;
    }

    protected get timeController(): TimelineTimeController {
        return this.mvc.getController("time") as TimelineTimeController;
    }

    protected get clipController(): TimelineClipController {
        return this.mvc.getController("clip") as TimelineClipController;
    }

    @auto()
    public set card(card: Card) {
        if (!this.model) return;
        this.model.setCardsData([card.data as YMap]);

        const selectedClip = this.screenManager.contextManager.getContext(2);

        // if (selectedClip && selectedClip[0] instanceof Clip) this.clipController.snapToClosest();
        // else this.clipController.snapAtEnd();
        this.clipController.reloadCurrentClip();
        this.card.duration = this.model.totalDuration;
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
        return this.model.totalDuration * this.pixelsPerSecondUnit * (this.screenManager.canvas.scale || 1);
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

    public reloadSize() {
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
        this.view.clipsContainer.addChild(indicator, index);
    }
}