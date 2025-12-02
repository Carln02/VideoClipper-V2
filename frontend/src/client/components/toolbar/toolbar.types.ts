import {VcProperties} from "../component/component.types";
import {Project} from "../../directors/project/project";
import {TurboTool} from "turbodombuilder";
import {ToolProperties} from "../tool/tool.types";
import {Tool} from "../tool/tool";

export type ToolbarToolProperties = (new (...args: any[]) => TurboTool) | ToolProperties | Tool;
export type ToolbarProperties = VcProperties<any, any, any, Project> & {
};