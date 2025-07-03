import {Coordinate, TurboView} from "turbodombuilder";
import {BranchingNode} from "./branchingNode";
import {BranchingNodeModel} from "./branchingNode.model";
import {ProjectScreens} from "../../directors/project/project.types";

export class BranchingNodeView<
    Element extends BranchingNode = BranchingNode<any, any>,
    Model extends BranchingNodeModel = BranchingNodeModel
> extends TurboView<Element, Model> {
    protected setupChangedCallbacks() {
        super.setupChangedCallbacks();

        this.emitter.add("origin", (value: Coordinate) => {
            // if (this.element.director.currentType === ProjectScreens.canvas)
            value = this.element.director.currentScreen.updatePos?.(value, this.element);
            this.element.setStyle("transform", `translate3d(calc(${value.x}px - 50%), calc(${value.y}px - 50%), 0)`);
    });
    }
}