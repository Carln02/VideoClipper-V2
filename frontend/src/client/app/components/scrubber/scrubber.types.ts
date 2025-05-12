import {VcComponentProperties} from "../component/component.types";
import {Timeline} from "../timeline/timeline";
import {DocumentManager} from "../../managers/documentManager/documentManager";

export type ScrubberProperties = VcComponentProperties<any, any, any, DocumentManager> & {
    timeline?: Timeline,
    scaled?: boolean,
};