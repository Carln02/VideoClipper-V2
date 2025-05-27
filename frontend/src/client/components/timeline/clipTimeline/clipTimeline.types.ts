import {TurboDrawerProperties} from "turbodombuilder";
import {YArray} from "../../../../yManagement/yManagement.types";
import {SyncedClip} from "../../clip/clip.types";
import {TimelineModel} from "../timeline.model";
import {TimelineProperties} from "../timeline.types";
import {ClipTimelineView} from "./clipTimeline.view";

export type ClipTimelineProperties<View extends ClipTimelineView = ClipTimelineView> = TimelineProperties<View> & {
    drawerProperties?: TurboDrawerProperties<View, YArray<SyncedClip>, TimelineModel>,
};