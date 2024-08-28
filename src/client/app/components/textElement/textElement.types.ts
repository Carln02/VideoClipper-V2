import {Coordinate} from "turbodombuilder";
import {ResizableType} from "../basicComponents/resizer/resizer.types";
import {SyncedType} from "../../abstract/syncedComponent/syncedComponent.types";

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

export type SyncedText = SyncedType<SyncedTextData>;