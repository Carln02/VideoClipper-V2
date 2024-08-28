import {SyncedComponent} from "../../abstract/syncedComponent/syncedComponent";
import {SyncedBranchingNode, SyncedBranchingNodeData} from "./branchingNode.types";
import {define, Point} from "turbodombuilder";
import "./branchingNode.css";
import {SyncedType, YWrapObserver} from "../../abstract/syncedComponent/syncedComponent.types";
import {FlowManagementHandler} from "../flow/handlers/types/flowManagement.handler";

/**
 * @class BranchingNode
 * @extends SyncedComponent
 * @implements YWrapObserver<SyncedBranchingNode>
 * @description Component representing a node where flows start, branch, or end. Can be manipulated and moved on the
 * canvas.
 * @template {SyncedBranchingNode} Type
 */
@define("branching-node")
export class BranchingNode<Type extends SyncedBranchingNode = SyncedBranchingNode> extends SyncedComponent<Type>
    implements YWrapObserver<SyncedBranchingNode> {
    constructor(data: Type, parent: HTMLElement) {
        super({parent: parent});
        if (data) this.data = data;
    }

    /**
     * @function create
     * @static
     * @async
     * @description Creates a new branching node from the provided data by adding the latter to the Yjs document.
     * @param {SyncedBranchingNodeData} data - The data to create the branching node from.
     * @returns {Promise<string>} - The ID of the created branching node in root.branchingNodes.
     */
    public static async create(data: SyncedBranchingNodeData): Promise<string> {
        return await super.createInObject(data, this.root.branchingNodes as SyncedType<Record<string, SyncedBranchingNode>>);
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
        for (const observer of this.getDataById(id).get_observers()) {
            if (observer instanceof BranchingNode) return observer;
        }
        return null;
    }

    /**
     * @function getAll
     * @static
     * @description Retrieves all branching nodes in the document.
     * @returns {BranchingNode[]} - Array containing all the branching nodes in the document.
     */
    public static getAll(): BranchingNode[] {
        return Object.values(this.root.branchingNodes).concat(Object.values(this.root.cards))
            .flatMap(branchingNodeData => branchingNodeData.get_observers())
            .filter(observer => observer instanceof BranchingNode);
    }

    /**
     * @function onOriginUpdated
     * @description YWrapper callback. Updates branching node's position when the data's origin field changes.
     */
    public onOriginUpdated() {
        this.setStyle("transform", `translate3d(calc(${this.data.origin.x}px - 50%), 
        calc(${this.data.origin.y}px - 50%), 0)`);
    }

    /**
     * @function move
     * @description Moves the branching node by the given values.
     * @param {Point} deltaPosition - The values by which to move the data.
     */
    public move(deltaPosition: Point) {
        this.data.origin = deltaPosition.add(this.data.origin).object;
    }

    /**
     * @function delete
     * @description Deletes the node data from the Yjs document, destroys all its attached components (including this),
     * amd updates the attached flows accordingly.
     */
    public delete() {
        FlowManagementHandler.updateFlowsOnDetachingCard(this.id);
        super.delete();
    }
}