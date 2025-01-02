import {Coordinate} from "turbodombuilder";
import {SyncedResizableType} from "../basicComponents/resizer/resizer.types";
import {MvcTurboProperties} from "../../../../mvc/mvc.types";
import {ClipRenderer} from "../clipRenderer/clipRenderer";
import {TextElementView} from "./textElement.view";
import {TextElementModel} from "./textElement.model";

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

export type TextElementProperties = MvcTurboProperties<TextElementView, SyncedText, TextElementModel> & {
    renderer: ClipRenderer
}