import {Clip} from "../clip/clip";

export type ClipTimelineEntry = {
    clip?: Clip,
    index?: number,
    offset?: number,
    closestIntersection?: number,
    distanceFromClosestIntersection?: number,
}