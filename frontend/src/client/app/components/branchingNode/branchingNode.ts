import {SyncedBranchingNode} from "./branchingNode.types";
import {Coordinate, define, Point} from "turbodombuilder";
import "./branchingNode.css";
import {YComponent} from "../../yjsManagement/yComponent";
import {YMap} from "../../../../yProxy/yProxy/types/base.types";

/**
 * @class BranchingNode
 * @extends SyncedComponent
 * @description Component representing a node where flows start, branch, or end. Can be manipulated and moved on the
 * canvas.
 * @template {SyncedBranchingNode} Type
 */
@define("branching-node")
export class BranchingNode<Type extends SyncedBranchingNode = SyncedBranchingNode> extends YComponent<Type> {
    public constructor(data: Type, parent: HTMLElement) {
        super({parent: parent});
        if (data) this.data = data;
    }

    public get origin(): Coordinate {
        return this.getData("origin") as Coordinate;
    }

    public set origin(value: Coordinate) {
        this.setData("origin", value);
    }

    public originChanged(value: Coordinate) {
        //TODO REMOVE
        if (value instanceof YMap) value = {
            x: value.get("x"),
            y: value.get("y")
        };

        this.setStyle("transform", `translate3d(calc(${value.x}px - 50%), calc(${value.y}px - 50%), 0)`);
    }

    /**
     * @function move
     * @description Moves the branching node by the given values.
     * @param {Point} deltaPosition - The values by which to move the data.
     */
    public move(deltaPosition: Point) {
        this.origin = deltaPosition.add(this.origin).object;
    }

    /**
     * @function delete
     * @description Deletes the node data from the Yjs document, destroys all its attached components (including this),
     * amd updates the attached flows accordingly.
     */
    public delete() {
        // FlowManagementHandler.updateFlowsOnDetachingCard(this.id);
        super.delete();
    }
}