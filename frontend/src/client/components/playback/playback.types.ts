import {Project} from "../../directors/project/project";
import {VcComponentProperties} from "../component/component.types";
import {PlaybackView} from "./playback.view";
import {PlaybackModel} from "./playback.model";
import {FlowPath} from "../flowPath/flowPath";
import {Card} from "../card/card";

export type PlaybackProperties = VcComponentProperties<PlaybackView, object, PlaybackModel, Project> & {
    path?: FlowPath,
    card?: Card
}