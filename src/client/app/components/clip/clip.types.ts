import {SyncedText, SyncedTextData} from "../textElement/textElement.types";
import {YBoolean, YNumber, YProxied, YProxiedArray, YString} from "../../../../yProxy";

export type SyncedClipData = {
    startTime?: number,
    endTime?: number,

    backgroundFill?: string,
    mediaId?: string,
    thumbnail?: string,

    content?: SyncedTextData[],
    color?: string,

    hidden?: boolean,
    muted?: boolean
};

export type SyncedClip = YProxied<{
    startTime?: YNumber,
    endTime?: YNumber,

    backgroundFill?: YString,
    mediaId?: YString,
    thumbnail?: YString,

    content?: YProxiedArray<SyncedText>,
    color?: YString,

    hidden?: YBoolean,
    muted?: YBoolean
}>;