import {SyncedClip} from "../clip/clip.types";
import {define} from "turbodombuilder";
import {ClipRenderer} from "../clipRenderer/clipRenderer";
import {Clip} from "../clip/clip";
import {Canvas} from "../../views/canvas/canvas";
import "./timeline.css";
import {Card} from "../card/card";
import {ClipTimelineEntry, TimelineProperties} from "./timeline.types";
import {TimelineView} from "./timeline.view";
import {TimelineModel} from "./timeline.model";
import {TurboDrawer} from "../drawer/drawer";
import {TimelinePlayController} from "./timeline.playController";
import {TimelineClipController} from "./timeline.clipController";
import {TimelineTimeController} from "./timeline.timeController";
import {TimelineClipHandler} from "./timeline.clipHandler";
import {TimelineTimeHandler} from "./timeline.timeHandler";
import { YArray } from "../../../../yManagement/yManagement.types";

@define("vc-timeline")
export class Timeline extends TurboDrawer<TimelineView, YArray<SyncedClip>, TimelineModel> {
    public readonly renderer: ClipRenderer;
    private readonly _card: Card;

    public constructor(properties: TimelineProperties) {
        super(properties);
        this.renderer = properties.renderer;
        this._card = properties.card;

        this.mvc.generate({
            viewConstructor: TimelineView,
            modelConstructor: TimelineModel,
            controllerConstructors: [TimelinePlayController, TimelineClipController, TimelineTimeController],
            handlerConstructors: [TimelineClipHandler, TimelineTimeHandler],
            data: properties.data
        });

        this.model.onClipAdded = (syncedClip, id) => {
            const clip = new Clip({timeline: this, data: syncedClip});
            this.view.clipsContainer.addChild(clip, id + 1);
            return clip;
        };

        this.model.onClipChanged = () => {
            this.timeController.reloadTime();
            this.clipController.reloadCurrentClip();
        };
    }

    protected get timeController(): TimelineTimeController {
        return this.mvc.getController("time") as TimelineTimeController;
    }

    protected get clipController(): TimelineClipController {
        return this.mvc.getController("clip") as TimelineClipController;
    }

    public get card(): Card {
        return this._card;
    }

    public get clips(): Clip[] {
        return this.model.getAllComponents();
    }

    public get currentClipInfo(): ClipTimelineEntry {
        return this.model.currentClipInfo;
    }

    public get currentClip(): Clip {
        return this.model.currentClip;
    }

    public get pixelsPerSecondUnit(): number {
        return this.model.pixelsPerSecondUnit;
    }

    public get width() {
        return this.model.totalDuration * this.pixelsPerSecondUnit * (Canvas.instance.scale || 1);
    }

    public removeClipAt(position: number) {
        return this.model.clipHandler.removeClipAt(position);
    }

    public reloadSize() {
        this.timeController.reloadTime();
    }
}