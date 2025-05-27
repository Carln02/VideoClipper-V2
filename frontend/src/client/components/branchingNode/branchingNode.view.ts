import {Coordinate, TurboView} from "turbodombuilder";
import {BranchingNode} from "./branchingNode";
import {BranchingNodeModel} from "./branchingNode.model";

export class BranchingNodeView<
    Element extends BranchingNode = BranchingNode<any, any>,
    Model extends BranchingNodeModel = BranchingNodeModel
> extends TurboView<Element, Model> {
    protected setupChangedCallbacks() {
        super.setupChangedCallbacks();

        this.emitter.add("origin", (value: Coordinate) => {
            this.element.setStyle("transform", `translate3d(calc(${value.x}px - 50%), calc(${value.y}px - 50%), 0)`);
        });
    }
}