import {Coordinate} from "turbodombuilder";
import {SyncedResizableType} from "../basicComponents/resizer/resizer.types";
import {ClipRenderer} from "../clipRenderer/clipRenderer";
import {TextElementView} from "./textElement.view";
import {TextElementModel} from "./textElement.model";
import {VcComponentProperties} from "../component/component.types";
import {Project} from "../../directors/project/project";

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

export type TextElementProperties = VcComponentProperties<TextElementView, SyncedText, TextElementModel, Project> & {
    renderer?: ClipRenderer
}