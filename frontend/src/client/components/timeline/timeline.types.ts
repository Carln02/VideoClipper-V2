import {SyncedClip} from "../clip/clip.types";
import {Card} from "../card/card";
import {ClipRenderer} from "../clipRenderer/clipRenderer";
import {TimelineModel} from "./timeline.model";
import {TimelineView} from "./timeline.view";
import {Project} from "../../directors/project/project";
import {VcProperties} from "../component/component.types";
import {YArray} from "turbodombuilder";

export type TimelineIndexInfo = {
    clipIndex?: number,
    cardIndex?: number,
    ghostingIndex?: number,
    offset?: number,
    closestIntersection?: number,
    distanceFromClosestIntersection?: number,
}

export type TimelineProperties<View extends TimelineView = TimelineView> =
    VcProperties<View, YArray<SyncedClip>, TimelineModel, Project> & {
    renderer: ClipRenderer,
    card?: Card,
    scaled?: boolean,
};