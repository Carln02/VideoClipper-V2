import {turbo, TurboEvent, TurboTool} from "turbodombuilder";
import {ToolType} from "../../directors/project/project.types";
import {Tool} from "../../components/tool/tool";
import {BranchingNode} from "../../components/branchingNode/branchingNode";
import {Project} from "../../directors/project/project";

export class CreateCardTool extends TurboTool<Tool> {
    public toolName = ToolType.createCard;

    public click(e: TurboEvent, target: Node): boolean {
        if (target instanceof BranchingNode) return true;
        if (target instanceof Project) {
            console.log("TOOL FIREDDD")
            console.log(turbo(this).isEmbeddedTool())
            e.stopImmediatePropagation()
            target.createNewCard(e.scaledPosition);
            return true;
        }
    }
}