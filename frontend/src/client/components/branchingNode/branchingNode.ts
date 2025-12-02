import {BranchingNodeType, SyncedBranchingNode} from "./branchingNode.types";
import {createYMap, define, element, Point, turbo, YMap} from "turbodombuilder";
import "./branchingNode.css";
import {BranchingNodeModel} from "./branchingNode.model";
import {BranchingNodeView} from "./branchingNode.view";
import {VcProperties} from "../component/component.types";
import {VcComponent} from "../component/component";
import {Project} from "../../directors/project/project";

/**
 * @class BranchingNode
 * @extends TurboElement
 * @description Component representing a node where flows start, branch, or end. Can be manipulated and moved on the
 * canvas.
 * @template {SyncedBranchingNode} Type
 */
@define()
export class BranchingNode<
    View extends BranchingNodeView = BranchingNodeView,
    Data extends SyncedBranchingNode = SyncedBranchingNode,
    Model extends BranchingNodeModel = BranchingNodeModel
> extends VcComponent<View, Data, Model, Project> {
    public static createData(data?: SyncedBranchingNode): YMap & SyncedBranchingNode {
        if (!data) data = {};
        if (!data.origin) data.origin = {x: 0, y: 0};
        data.type = BranchingNodeType.node;
        return createYMap(data);
    }

    /**
     * @function move
     * @description Moves the branching node by the given values.
     * @param {Point} deltaPosition - The values by which to move the data.
     */
    public move(deltaPosition: Point) {
        //TODO CHECK SUBSTRATE
        this.model.origin = deltaPosition.add(this.model.origin).object;
        this.director.flows.forEach((flow) => flow.updateAfterMovingNode(this.dataId, deltaPosition));
    }

    /**
     * @function delete
     * @description Deletes the node data from the Yjs document, destroys all its attached components (including this),
     * amd updates the attached flows accordingly.
     */
    public delete() {
        this.director.flows.forEach(flow => flow.updateOnDetachingNode(this.dataId));
        this.director.delete(this);
    }
}

export function branchingNode<
    View extends BranchingNodeView = BranchingNodeView,
    Data extends SyncedBranchingNode = SyncedBranchingNode,
    Model extends BranchingNodeModel = BranchingNodeModel
>(properties: VcProperties<View, Data, Model, Project> = {}): BranchingNode<View, Data, Model> {
    turbo(properties).applyDefaults({
        tag: "vc-branching-node",
        view: BranchingNodeView as new () => View,
        model: BranchingNodeModel as any
    });
    return element({...properties}) as BranchingNode<View, Data, Model>;
}