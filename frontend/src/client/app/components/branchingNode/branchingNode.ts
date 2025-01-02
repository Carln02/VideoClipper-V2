import {SyncedBranchingNode} from "./branchingNode.types";
import {define, Point} from "turbodombuilder";
import "./branchingNode.css";
import {BranchingNodeModel} from "./branchingNode.model";
import {BranchingNodeView} from "./branchingNode.view";
import {YComponent} from "../../../../yManagement/yMvc/yComponent";
import {MvcTurboProperties} from "../../../../mvc/mvc.types";

/**
 * @class BranchingNode
 * @extends SyncedComponent
 * @description Component representing a node where flows start, branch, or end. Can be manipulated and moved on the
 * canvas.
 * @template {SyncedBranchingNode} Type
 */
@define()
export class BranchingNode<
    View extends BranchingNodeView = BranchingNodeView,
    Data extends SyncedBranchingNode = SyncedBranchingNode,
    Model extends BranchingNodeModel = BranchingNodeModel
> extends YComponent<View, Data, Model> {
    public constructor(properties: MvcTurboProperties<View, Data, Model> = {}) {
        super(properties);
        if (properties.data) {
            console.log("SETTING U{ NODE")
            this.generateViewAndModel(BranchingNodeView as new () => View,
                BranchingNodeModel as new () => Model, properties.data);
        }
    }

    /**
     * @function move
     * @description Moves the branching node by the given values.
     * @param {Point} deltaPosition - The values by which to move the data.
     */
    public move(deltaPosition: Point) {
        this.model.origin = deltaPosition.add(this.model.origin).object;
    }

    /**
     * @function delete
     * @description Deletes the node data from the Yjs document, destroys all its attached components (including this),
     * amd updates the attached flows accordingly.
     */
    public delete() {
        // FlowManagementHandler.updateFlowsOnDetachingCard(this.id);
    }
}