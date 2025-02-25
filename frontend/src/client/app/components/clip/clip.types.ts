import {SyncedText} from "../textElement/textElement.types";
import {YArray} from "../../../../yProxy";
import {ClipView} from "./clip.view";
import {ClipModel} from "./clip.model";
import {Timeline} from "../timeline/timeline";
import {TurboProperties} from "turbodombuilder";

export type SyncedClip = {
    startTime?: number,
    endTime?: number,

    backgroundFill?: string,
    mediaId?: string,
    thumbnail?: string,

    content?: YArray<SyncedText>,
    color?: string,

    hidden?: boolean,
    muted?: boolean
};

export type ClipProperties = TurboProperties<"div", ClipView, SyncedClip, ClipModel> & {
    timeline: Timeline
};