import {SyncedText} from "../textElement/textElement.types";
import {ClipView} from "./clip.view";
import {ClipModel} from "./clip.model";
import {Timeline} from "../timeline/timeline";
import {TurboProperties} from "turbodombuilder";
import { YArray } from "../../../../yManagement/yManagement.types";
import {VcComponentProperties} from "../component/component.types";
import {DocumentManager} from "../../managers/documentManager/documentManager";

export type SyncedClip = {
    startTime?: number,
    endTime?: number,

    backgroundFill?: string,
    mediaId?: string,
    thumbnail?: string,

    content?: YArray<SyncedText>,
    color?: string,

    hidden?: boolean,
    muted?: boolean
};

export type ClipProperties = VcComponentProperties<ClipView, SyncedClip, ClipModel, DocumentManager> & {
    timeline: Timeline
};