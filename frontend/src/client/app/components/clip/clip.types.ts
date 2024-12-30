import {SyncedText} from "../textElement/textElement.types";
import {YArray} from "../../../../yProxy";

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