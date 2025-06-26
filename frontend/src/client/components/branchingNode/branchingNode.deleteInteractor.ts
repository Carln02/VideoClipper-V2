import {TurboInteractor} from "turbodombuilder";
import {ToolType} from "../../directors/project/project.types";
import {BranchingNode} from "./branchingNode";
import {BranchingNodeView} from "./branchingNode.view";
import {BranchingNodeModel} from "./branchingNode.model";

export class BranchingNodeDeleteInteractor extends TurboInteractor<ToolType, BranchingNode, BranchingNodeView, BranchingNodeModel> {
    public tool = ToolType.delete;

    public click() {
        this.element.delete();
    }
}