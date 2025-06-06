import {SyncedClip} from "../clip/clip.types";
import {Card} from "../card/card";
import {ClipRenderer} from "../clipRenderer/clipRenderer";
import {TimelineModel} from "./timeline.model";
import {TimelineView} from "./timeline.view";
import {YArray} from "../../../yManagement/yManagement.types";
import {Project} from "../../screens/project/project";
import {VcComponentProperties} from "../component/component.types";

export type TimelineIndexInfo = {
    clipIndex?: number,
    cardIndex?: number,
    ghostingIndex?: number,
    offset?: number,
    closestIntersection?: number,
    distanceFromClosestIntersection?: number,
}

export type TimelineProperties<View extends TimelineView = TimelineView> =
    VcComponentProperties<View, YArray<SyncedClip>, TimelineModel, Project> & {
    renderer: ClipRenderer,
    card?: Card,
    scaled?: boolean,
};