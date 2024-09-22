import {Coordinate} from "turbodombuilder";
import {ResizableType} from "../basicComponents/resizer/resizer.types";
import {YCoordinate, YNumber, YProxied, YString} from "../../../../yProxy/yProxy/types/proxied.types";

export enum TextType {
    custom = "custom",
    title = "title",
    author = "author",
    timestamp = "timestamp"
}

export type SyncedText = ResizableType & YProxied<{
    text?: YString,
    type?: YProxied<TextType>,
    origin?: YCoordinate,
    fontSize?: YNumber
}>;