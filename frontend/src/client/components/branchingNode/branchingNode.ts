import {BranchingNodeType, SyncedBranchingNode} from "./branchingNode.types";
import {define, Point} from "turbodombuilder";
import "./branchingNode.css";
import {BranchingNodeModel} from "./branchingNode.model";
import {BranchingNodeView} from "./branchingNode.view";
import {VcComponentProperties} from "../component/component.types";
import {VcComponent} from "../component/component";
import {Project} from "../../directors/project/project";
import {YUtilities} from "../../../yManagement/yUtilities";
import { YMap } from "../../../yManagement/yManagement.types";
import {BranchingNodeSelectionInteractor} from "./branchingNode.selectionInteractor";

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
    public constructor(properties: VcComponentProperties<View, Data, Model, Project> = {}) {
        super(properties);
        if (properties.data) this.mvc.generate({
            viewConstructor: BranchingNodeView as new () => View,
            modelConstructor: BranchingNodeModel as new () => Model,
            data: properties.data,
            interactorConstructors: [BranchingNodeSelectionInteractor]
        });
    }

    public static createData(data?: SyncedBranchingNode): YMap & SyncedBranchingNode {
        if (!data) data = {};
        if (!data.origin) data.origin = {x: 0, y: 0};
        data.type = BranchingNodeType.node;
        return YUtilities.createYMap(data);
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
        this.director.flows.forEach(flow => flow.updateOnDetachingNode(this.dataId));
        this.director.delete(this);
    }
}