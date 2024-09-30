import {Coordinate} from "turbodombuilder";
import {ResizableType, SyncedResizableType} from "../basicComponents/resizer/resizer.types";
import {YCoordinate, YNumber, YProxied, YString} from "../../../../yProxy";

export enum TextType {
    custom = "custom",
    title = "title",
    author = "author",
    timestamp = "timestamp"
}

export type SyncedTextData = ResizableType & {
    text?: string,
    type?: TextType,
    origin?: Coordinate,
    fontSize?: number
};

export type SyncedText = SyncedResizableType & {
    text?: YString,
    type?: YProxied<TextType>,
    origin?: YCoordinate,
    fontSize?: YNumber
};