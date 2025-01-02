import {Coordinate} from "turbodombuilder";
import {YMap} from "../../../../yProxy/yProxy/types/base.types";
import {BranchingNode} from "./branchingNode";
import {BranchingNodeModel} from "./branchingNode.model";
import {YView} from "../../../../yManagement/yMvc/yView";

export class BranchingNodeView<
    Element extends BranchingNode = BranchingNode<any, any>,
    Model extends BranchingNodeModel = BranchingNodeModel
> extends YView<Element, Model> {
    public constructor(element: Element, model: BranchingNodeModel) {
        super(element, model as Model);
    }

    protected setupChangedCallbacks() {
        super.setupChangedCallbacks();
        this.setChangedCallback("origin", (value: Coordinate) => {
            if (value instanceof YMap) value = {x: value.get("x"), y: value.get("y")}; //TODO REMOVE
            this.element.setStyle("transform", `translate3d(calc(${value.x}px - 50%), calc(${value.y}px - 50%), 0)`);
        });
    }
}