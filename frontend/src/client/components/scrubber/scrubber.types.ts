import {VcComponentProperties} from "../component/component.types";
import {Timeline} from "../timeline/timeline";
import {Project} from "../../directors/project/project";

export type ScrubberProperties = VcComponentProperties<any, any, any, Project> & {
    timeline?: Timeline,
    scaled?: boolean,
};