import {SyncedBranchingNode} from "./branchingNode.types";
import {define, Point, TurboProperties} from "turbodombuilder";
import "./branchingNode.css";
import {BranchingNodeModel} from "./branchingNode.model";
import {BranchingNodeView} from "./branchingNode.view";
import {YComponent} from "../../../../yManagement/yMvc/yComponent";

/**
 * @class BranchingNode
 * @extends SyncedComponent
 * @description Component representing a node where flows start, branch, or end. Can be manipulated and moved on the
 * canvas.
 * @template {SyncedBranchingNode} Type
 */
@define("branching-node")
export class BranchingNode<
    View extends BranchingNodeView = BranchingNodeView,
    Model extends BranchingNodeModel = BranchingNodeModel
> extends YComponent<View, Model> {
    public constructor(data: SyncedBranchingNode, properties: TurboProperties = {}) {
        super(properties);
        if (data) {
            this.model = new BranchingNodeModel(data, this) as Model;
            this.view = new BranchingNodeView(this) as unknown as View;
            this.model.initialize();
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