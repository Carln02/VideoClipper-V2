import {VcComponentProperties} from "../component/component.types";
import {Project} from "../../directors/project/project";
import {Tool, ToolProperties} from "turbodombuilder";

export type ToolbarProperties<ToolType = string> = VcComponentProperties<any, any, any, Project> & {
    tools?: (ToolType | ToolProperties<ToolType> | Tool<ToolType>)[]
};