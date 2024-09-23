import {SyncedComponent} from "../../abstract/syncedComponent/syncedComponent";
import {SyncedBranchingNode, SyncedBranchingNodeData} from "./branchingNode.types";
import {define, Point} from "turbodombuilder";
import "./branchingNode.css";
import {YCoordinate, YProxyEventName} from "../../../../yProxy";

/**
 * @class BranchingNode
 * @extends SyncedComponent
 * @implements YWrapObserver<SyncedBranchingNode>
 * @description Component representing a node where flows start, branch, or end. Can be manipulated and moved on the
 * canvas.
 * @template {SyncedBranchingNode} Type
 */
@define("branching-node")
export class BranchingNode<Type extends SyncedBranchingNode = SyncedBranchingNode> extends SyncedComponent<Type> {
    constructor(data: Type, parent: HTMLElement) {
        super({parent: parent});
        if (data) this.data = data;
    }

    protected setupCallbacks() {
        this.data.origin.bind(YProxyEventName.selfOrSubTreeChanged, () => {
            this.setStyle("transform", `translate3d(calc(${this.data.origin.x}px - 50%), 
            calc(${this.data.origin.y}px - 50%), 0)`);
        }, this);
    }

    /**
     * @function create
     * @static
     * @async
     * @description Creates a new branching node from the provided data by adding the latter to the Yjs document.
     * @param {SyncedBranchingNode} data - The data to create the branching node from.
     * @returns {Promise<string>} - The ID of the created branching node in root.branchingNodes.
     */
    public static async create(data: SyncedBranchingNodeData): Promise<string> {
        return await super.createInObject(data, this.root.branchingNodes);
    }

    /**
     * @function getDataById
     * @static
     * @description Retrieves the branching node data with the corresponding ID.
     * @param {string} id - The ID of the data to retrieve.
     * @returns {SyncedBranchingNode} - The data retrieved (if any).
     */
    public static getDataById(id: string): SyncedBranchingNode {
        return this.root.branchingNodes[id] || this.root.cards[id];
    }

    /**
     * @function getById
     * @static
     * @description Retrieves the branching node attached to the data with the corresponding ID.
     * @param {string} id - The ID of the data.
     * @returns {BranchingNode} - The branching node retrieved (if any).
     */
    public static getById(id: string): BranchingNode {
        return this.getDataById(id).getBoundObjectOfType(BranchingNode);
    }

    /**
     * @function getAll
     * @static
     * @description Retrieves all branching nodes in the document.
     * @returns {BranchingNode[]} - Array containing all the branching nodes in the document.
     */
    public static getAll(): BranchingNode[] {
        return Object.values(this.root.branchingNodes.value).concat(Object.values(this.root.cards.value))
            .flatMap(branchingNodeData => branchingNodeData.getBoundObjectsOfType(BranchingNode))
    }

    /**
     * @function move
     * @description Moves the branching node by the given values.
     * @param {Point} deltaPosition - The values by which to move the data.
     */
    public move(deltaPosition: Point) {
        this.data.origin = deltaPosition.add(this.data.origin.value).object as YCoordinate;
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