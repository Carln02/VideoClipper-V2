import {Coordinate} from "turbodombuilder";
import {SyncedResizableType} from "../basicComponents/resizer/resizer.types";

export enum TextType {
    custom = "custom",
    title = "title",
    author = "author",
    timestamp = "timestamp"
}

export type SyncedText = SyncedResizableType & {
    text?: string,
    type?: TextType,
    origin?: Coordinate,
    fontSize?: number
};