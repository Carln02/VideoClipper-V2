import {effect, turbo, TurboView} from "turbodombuilder";
import {BranchingNode} from "./branchingNode";
import {BranchingNodeModel} from "./branchingNode.model";
import {ProjectScreens} from "../../directors/project/project.types";

export class BranchingNodeView<
    Element extends BranchingNode = BranchingNode<any, any>,
    Model extends BranchingNodeModel = BranchingNodeModel
> extends TurboView<Element, Model> {
    @effect private updatePosition() {
        if (this.element.director.currentType === ProjectScreens.canvas)
            turbo(this).setStyle("transform", `translate3d(calc(${this.model.origin?.x}px - 50%), 
            calc(${this.model.origin?.y}px - 50%), 0)`);
    }
}