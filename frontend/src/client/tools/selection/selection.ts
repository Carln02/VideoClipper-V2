import {define, turbo} from "turbodombuilder";
import {tool, Tool} from "../../components/tool/tool";
import {ToolProperties} from "../../components/tool/tool.types";
import {SelectionModel} from "./selection.model";
import {SelectionClipController} from "./selection.clipController";
import {SelectionTool} from "./selection.tool";
import {SelectionView} from "./selection.view";

@define("vc-selection-tool")
export class Selection extends Tool<SelectionView, any, SelectionModel> {
}

export function selectionTool(properties: ToolProperties<SelectionView, any, SelectionModel>): Selection {
    turbo(properties).applyDefaults({
        tag: "vc-selection-tool",
        model: SelectionModel,
        view: SelectionView,
        controllers: SelectionClipController,
        tools: SelectionTool
    });
    return tool({...properties}) as Selection;
}