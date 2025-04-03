import {Clip} from "../clip/clip";
import {SyncedClip} from "../clip/clip.types";
import {Card} from "../card/card";
import {ClipRenderer} from "../clipRenderer/clipRenderer";
import {TimelineModel} from "./timeline.model";
import {TimelineView} from "./timeline.view";
import {TurboDrawerProperties} from "turbodombuilder";
import { YArray } from "../../../../yManagement/yManagement.types";
import {DocumentManager} from "../../managers/documentManager/documentManager";

export type ClipTimelineEntry = {
    clip?: Clip,
    index?: number,
    offset?: number,
    closestIntersection?: number,
    distanceFromClosestIntersection?: number,
}

export type TimelineProperties = TurboDrawerProperties<TimelineView, YArray<SyncedClip>, TimelineModel> & {
    screenManager: DocumentManager,
    card: Card,
    renderer: ClipRenderer
};