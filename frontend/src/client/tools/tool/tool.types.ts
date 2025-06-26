import {ToolProperties} from "turbodombuilder";
import {Project} from "../../directors/project/project";

export type VcToolProperties<ToolType = string> = ToolProperties<ToolType> & {
    director: Project
};