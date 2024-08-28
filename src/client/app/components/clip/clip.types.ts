import {SyncedText} from "../textElement/textElement.types";
import {SyncedType} from "../../abstract/syncedComponent/syncedComponent.types";

export type SyncedClipData = {
    startTime?: number,
    endTime?: number,
    backgroundFill?: string,
    mediaId?: number,
    content?: SyncedText[],
    color?: string,
    thumbnail?: string,
    hidden?: boolean,
    muted?: boolean
}

export type SyncedClip = SyncedType<SyncedClipData>;