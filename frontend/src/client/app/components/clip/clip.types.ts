import {SyncedText} from "../textElement/textElement.types";
import {YArray} from "../../../../yProxy";
import {MvcTurboProperties} from "../../../../mvc/mvc.types";
import {ClipView} from "./clip.view";
import {ClipModel} from "./clip.model";
import {Timeline} from "../timeline/timeline";

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

export type ClipProperties = MvcTurboProperties<ClipView, SyncedClip, ClipModel> & {
    timeline: Timeline
};