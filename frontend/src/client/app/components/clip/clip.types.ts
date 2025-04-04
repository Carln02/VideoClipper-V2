import {SyncedText} from "../textElement/textElement.types";
import {ClipView} from "./clip.view";
import {ClipModel} from "./clip.model";
import {Timeline} from "../timeline/timeline";
import {VcComponentProperties} from "../component/component.types";
import {DocumentManager} from "../../managers/documentManager/documentManager";
import {YArray} from "yjs/dist/src/types/YArray";

export type SyncedClip = {
    startTime?: number,
    endTime?: number,

    backgroundFill?: string,
    mediaId?: string,
    thumbnail?: string,

    content?: SyncedText[] | YArray<SyncedText>,
    color?: string,

    hidden?: boolean,
    muted?: boolean
};

export type ClipProperties = VcComponentProperties<ClipView, SyncedClip, ClipModel, DocumentManager> & {
    timeline: Timeline
};