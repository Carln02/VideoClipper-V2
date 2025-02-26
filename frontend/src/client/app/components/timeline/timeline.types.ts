import {Clip} from "../clip/clip";
import {YArray} from "../../../../yProxy/yProxy/types/base.types";
import {SyncedClip} from "../clip/clip.types";
import {Card} from "../card/card";
import {ClipRenderer} from "../clipRenderer/clipRenderer";
import {TimelineModel} from "./timeline.model";
import {TimelineView} from "./timeline.view";
import {TurboDrawerProperties} from "turbodombuilder";

export type ClipTimelineEntry = {
    clip?: Clip,
    index?: number,
    offset?: number,
    closestIntersection?: number,
    distanceFromClosestIntersection?: number,
}

export type TimelineProperties = TurboDrawerProperties<TimelineView, YArray<SyncedClip>, TimelineModel> & {
    card: Card,
    renderer: ClipRenderer
};