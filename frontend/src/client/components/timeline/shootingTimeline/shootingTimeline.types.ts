import {TurboDrawerProperties} from "turbodombuilder";
import {YArray} from "../../../../yManagement/yManagement.types";
import {SyncedClip} from "../../clip/clip.types";
import {TimelineModel} from "../timeline.model";
import {TimelineProperties} from "../timeline.types";
import {ShootingTimelineView} from "./shootingTimeline.view";

export type ShootingTimelineProperties<View extends ShootingTimelineView = ShootingTimelineView> = TimelineProperties<View> & {
    drawerProperties?: TurboDrawerProperties<View, YArray<SyncedClip>, TimelineModel>,
};