import {SyncedText} from "../textElement/textElement.types";
import {YBoolean, YNumber, YProxied, YProxiedArray, YString} from "../../../../yProxy/yProxy/types/proxied.types";

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