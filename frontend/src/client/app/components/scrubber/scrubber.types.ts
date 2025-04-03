import {VcComponentProperties} from "../component/component.types";
import {Timeline} from "../timeline/timeline";
import {DocumentManager} from "../../managers/documentManager/documentManager";

export enum ScrubberMenu {
    split = "split",
    mute = "mute",
    insertCard = "insertCard",
    trimRight = "trimRight",
    deleteRight = "deleteRight",
    delete = "delete",
    trimLeft = "trimLeft",
    deleteLeft = "deleteLeft",
    reshoot = "reshoot",
    hide = "hide"
}

export type ScrubberProperties = VcComponentProperties<any, any, any, DocumentManager> & {
    timeline?: Timeline;
};