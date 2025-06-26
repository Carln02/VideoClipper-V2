import {SyncedText} from "../textElement/textElement.types";
import {ClipModel} from "./clip.model";
import {Timeline} from "../timeline/timeline";
import {VcComponentProperties} from "../component/component.types";
import {Project} from "../../directors/project/project";
import {YArray} from "yjs/dist/src/types/YArray";
import {TurboView} from "turbodombuilder";

export type SyncedClip = {
    startTime?: number,
    endTime?: number,

    backgroundFill?: string,
    mediaId?: string,
    thumbnail?: string,

    content?: SyncedText[] | YArray<SyncedText>,
    color?: string,

    hidden?: boolean,
    muted?: boolean
};

export type ClipProperties<
    View extends TurboView = TurboView,
    Data extends SyncedClip = SyncedClip,
    Model extends ClipModel = ClipModel,
    Manager extends Project = Project
> = VcComponentProperties<View, Data, Model, Manager> & {
    timeline?: Timeline
};