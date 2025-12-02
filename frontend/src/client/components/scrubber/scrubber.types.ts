import {VcProperties} from "../component/component.types";
import {Timeline} from "../timeline/timeline";
import {Project} from "../../directors/project/project";

export type ScrubberProperties = VcProperties<any, any, any, Project> & {
    timeline?: Timeline,
    scaled?: boolean,
};