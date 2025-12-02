import {TurboTool} from "turbodombuilder";
import {Tool} from "../../components/tool/tool";
import {ToolType} from "../../directors/project/project.types";

export class DeleteTool extends TurboTool<Tool> {
    public toolName = ToolType.delete;

    public click(e: Event, target: Node): boolean {
        if ("delete" in target && typeof target.delete === "function") {
            target.delete();
            return true;
        }
    }
}