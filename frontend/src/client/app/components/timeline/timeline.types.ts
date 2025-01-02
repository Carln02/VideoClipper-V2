import {Clip} from "../clip/clip";
import {MvcTurboProperties} from "../../../../mvc/mvc.types";
import {YArray} from "../../../../yProxy/yProxy/types/base.types";
import {SyncedClip} from "../clip/clip.types";
import {Card} from "../card/card";
import {ClipRenderer} from "../clipRenderer/clipRenderer";
import {PanelThumbProperties} from "../basicComponents/panelThumb/panelThumb.types";
import {TimelineModel} from "./timeline.model";
import {TimelineView} from "./timeline.view";

export type ClipTimelineEntry = {
    clip?: Clip,
    index?: number,
    offset?: number,
    closestIntersection?: number,
    distanceFromClosestIntersection?: number,
}

export type TimelineProperties = MvcTurboProperties<TimelineView, YArray<SyncedClip>, TimelineModel,
    PanelThumbProperties> & {
    card: Card,
    renderer: ClipRenderer
};