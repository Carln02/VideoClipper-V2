import {TurboDragEvent, TurboInteractor} from "turbodombuilder";
import {BranchingNode} from "./branchingNode";
import {BranchingNodeModel} from "./branchingNode.model";
import {ToolType} from "../../directors/project/project.types";
import {BranchingNodeView} from "./branchingNode.view";

export class BranchingNodeSelectionInteractor extends TurboInteractor<ToolType, BranchingNode, BranchingNodeView, BranchingNodeModel> {
    public tool = ToolType.selection;

    public clickStart() {
        this.element.director.contextManager.setContext(this.element, 1);
    }

    public drag(e: TurboDragEvent) {
        //TODO CHECK SUBSTRATE
        console.log("dragged");
        this.model.origin = e.scaledDeltaPosition.add(this.model.origin).object;
        this.element.director.flows.forEach((flow) =>
            flow.updateAfterMovingNode(this.element.dataId, e.scaledDeltaPosition));
    }
}