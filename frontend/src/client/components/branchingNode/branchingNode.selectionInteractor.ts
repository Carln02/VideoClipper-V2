import {TurboDragEvent, TurboInteractor} from "turbodombuilder";
import {BranchingNode} from "./branchingNode";
import {BranchingNodeModel} from "./branchingNode.model";
import {ToolType} from "../../directors/project/project.types";
import {BranchingNodeView} from "./branchingNode.view";

export class BranchingNodeSelectionInteractor extends TurboInteractor<ToolType, any, BranchingNode, BranchingNodeView, BranchingNodeModel> {
    public dragAction(e: TurboDragEvent) {
        this.model.origin = e.scaledDeltaPosition.add(this.model.origin).object;
    }
}