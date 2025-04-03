import {SyncedClip} from "../clip/clip.types";
import {auto, define} from "turbodombuilder";
import {ClipRenderer} from "../clipRenderer/clipRenderer";
import {Clip} from "../clip/clip";
import {Canvas} from "../../screens/canvas/canvas";
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
import {DocumentManager} from "../../managers/documentManager/documentManager";

@define("vc-timeline")
export class Timeline extends TurboDrawer<TimelineView, YArray<SyncedClip>, TimelineModel> {
    public screenManager: DocumentManager;
    public readonly renderer: ClipRenderer;

    public constructor(properties: TimelineProperties) {
        super(properties);
        this.renderer = properties.renderer;
        this.card = properties.card;
        this.screenManager = properties.screenManager;

        this.mvc.generate({
            viewConstructor: TimelineView,
            modelConstructor: TimelineModel,
            controllerConstructors: [TimelinePlayController, TimelineClipController, TimelineTimeController],
            handlerConstructors: [TimelineClipHandler, TimelineTimeHandler],
            data: properties.data,
            initialize: false
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

        this.mvc.initialize();
    }

    protected get timeController(): TimelineTimeController {
        return this.mvc.getController("time") as TimelineTimeController;
    }

    protected get clipController(): TimelineClipController {
        return this.mvc.getController("clip") as TimelineClipController;
    }

    @auto()
    public set card(card: Card) {
        if (this.model) this.data = card.syncedClips;
        //TODO
        // const selectedClip = ContextManager.instance.getContext(2);
        // if (selectedClip && selectedClip[0] instanceof Clip) this.snapToClosest();
        // else this.snapAtEnd();
        // this.reloadCurrentClip(true);
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
        return this.model.totalDuration * this.pixelsPerSecondUnit * (this.screenManager.canvas.scale || 1);
    }

    public removeClipAt(position: number) {
        return this.model.clipHandler.removeClipAt(position);
    }

    public reloadSize() {
        this.timeController.reloadTime();
    }
}