import {auto, define} from "turbodombuilder";
import {ClipRenderer} from "../clipRenderer/clipRenderer";
import {Clip} from "../clip/clip";
import "./timeline.css";
import {Card} from "../card/card";
import {TimelineProperties} from "./timeline.types";
import {TimelineView} from "./timeline.view";
import {TimelineModel} from "./timeline.model";
import {TimelinePlayController} from "./timeline.playController";
import {TimelineClipController} from "./timeline.clipController";
import {TimelineTimeController} from "./timeline.timeController";
import {TimelineClipHandler} from "./timeline.clipHandler";
import {TimelineTimeHandler} from "./timeline.timeHandler";
import {DocumentManager} from "../../managers/documentManager/documentManager";
import {Timeline} from "./timeline";

@define("vc-clip-timeline")
export class ClipTimeline extends Timeline {
    public screenManager: DocumentManager;
    public readonly renderer: ClipRenderer;

    public constructor(properties: TimelineProperties<View>) {
        super(properties);
        this.scaled = true;

        this.mvc.generate({
            viewConstructor: TimelineView,
            modelConstructor: TimelineModel,
            controllerConstructors: [TimelinePlayController, TimelineClipController, TimelineTimeController],
            handlerConstructors: [TimelineClipHandler, TimelineTimeHandler],
            data: properties.data,
            initialize: false
        });

        this.model.onCardAdded = (cardId) => this.screenManager.getNode(cardId) as Card;
        this.model.onClipAdded = (syncedClip, id, blockKey) => {
            const clip = new Clip({timeline: this, screenManager: this.screenManager});
            const snapToNext = id === this.model.indexInfo?.closestIntersection;
            this.view.clipsContainer.addChild(clip, this.model.clipHandler.convertBlockScopeToIndex(id + 1, blockKey));

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
        if (properties.scaled !== undefined) this.scaled = properties.scaled;
        this.card = properties.card;
    }

    @auto()
    public set scaled(value: boolean) {
        if (this.view && this.view.scrubber) this.view.scrubber.scaled = value;
    }

    protected get timeController(): TimelineTimeController {
        return this.mvc.getController("time") as TimelineTimeController;
    }

    protected get clipController(): TimelineClipController {
        return this.mvc.getController("clip") as TimelineClipController;
    }

    public get width() {
        return this.model.totalDuration * this.pixelsPerSecondUnit * ((this.scaled ? this.screenManager.canvas.scale : 1) || 1);
    }

    public addIndicatorAt(indicator: Element, index: number) {
        indicator.remove();
        this.view.clipsContainer.addChild(indicator, index);
    }
}