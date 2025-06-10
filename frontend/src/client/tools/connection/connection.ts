import {Tool} from "../tool/tool";
import {ClosestOrigin, define, TurboDragEvent, TurboEvent} from "turbodombuilder";
import {ToolType} from "../../managers/toolManager/toolManager.types";
import {BranchingNode} from "../../components/branchingNode/branchingNode";
import {Flow} from "../../components/flow/flow";
import {FlowPoint} from "../../components/flow/flow.types";
import {Project} from "../../directors/project/project";

/**
 * @description Tool that handles creating flows and connecting nodes
 */
@define("connection-tool")
export class ConnectionTool extends Tool {
    private _currentFlow: Flow;
    private _currentFlowId: string;
    private lastNodeId: string = null;

    //Interval indicating the frequency at which points are permanently added to the flow
    //A higher value will increase the smoothing effect of the flow
    private readonly drawingInterval: number = 150 as const;
    //The last time a point was added permanently (used for when drawing flows)
    private lastDrawnTime: number = 0;

    public constructor(project: Project) {
        super(project, ToolType.connection);
    }

    private get currentFlowId(): string {
        return this._currentFlowId;
    }

    private set currentFlowId(value: string) {
        this._currentFlowId = value;
        this._currentFlow = undefined;
    }

    private get currentFlow(): Flow {
        if (!this._currentFlow) this._currentFlow = this.project.getFlow(this.currentFlowId);
        return this._currentFlow;
    }

    private async initializeFlow(e: TurboEvent) {
        //Reset drawing time
        this.lastDrawnTime = Date.now();
        //Save closest node
        const closestNode: BranchingNode = e.closest(BranchingNode, true, ClosestOrigin.position);
        //If clicking on a node
        if (closestNode) {
            //Set last node ID
            this.lastNodeId = closestNode.dataId;
            //Find first flow intersection with this node
            let intersection: FlowPoint;
            for (const flow of this.project.flows) {
                intersection = flow.findNodeEntry(this.lastNodeId);
                if (intersection) break;
            }

            //If intersection found
            if (intersection && intersection.flowId != undefined) {
                //Assign flow ID
                this.currentFlowId = intersection.flowId;
                //Create a new branch at this node
                return await this.currentFlow.branchAtPoint(intersection, e.scaledPosition, this.lastNodeId);
            }

            //Otherwise --> create a new flow
            this.currentFlowId = await this.project.createNewFlow(e.scaledPosition, this.lastNodeId,"#439045");
            return;
        }

        //Otherwise --> get the point data (if any) that the user initiated the drag from
        // const closestPoint = FlowIntersectionHandler.flowIntersectingWithPoint(e.scaledPosition);
        // //Return if null
        // if (!closestPoint || !closestPoint.flowId) return;
        //
        // this.currentFlow = Flow.getById(closestPoint.flowId);
        // //Update last node ID
        // this.lastNodeId = closestPoint.lastNodeId;
        // //Branch (temporarily) at point to later update the original path
        // return this.currentFlow.branchingHandler.branchAtPoint(closestPoint, e.scaledPosition,
        //     undefined, true, true);
    }

    //On click --> create a point if the click is inside a node, otherwise cancel flow
    public clickAction(e: TurboEvent) {
        //Get the closest node to the event's target
        const closestNode = e.closest(BranchingNode);
        //Otherwise --> store last node ID
        if (closestNode) this.lastNodeId = closestNode.dataId.toString();
        //If no current flow --> try to initialize one
        if (!this.currentFlow) return this.initializeFlow(e);
        //If clicked outside a node --> end current flow (if any) and return
        if (!closestNode) return this.endAndClear();
        //Add a point to this flow, with the closestNode's ID
        this.currentFlow.addPoint(e.scaledPosition, this.lastNodeId);
    }

    public dragStart(e: TurboDragEvent) {
        //Return if already creating/editing a flow
        if (this.currentFlowId) return;
        this.initializeFlow(e);
    }

    public moveAction(e: TurboDragEvent) {
        this.currentFlow?.addPoint(e.scaledPosition, null, true);
    }

    //On drag --> draw flow
    public dragAction(e: TurboDragEvent) {
        //Return if no current flow
        if (!this.currentFlow || !this.currentFlow.currentBranch) return;
        //Get the closest node
        const closestNode = e.closest(BranchingNode, true, ClosestOrigin.position);
        //Check if drawing a temporary or permanent point
        //If drawing into a new node --> ignore interval and add a point. This ensures that when a user hits a
        // new node, it is added to the flow
        const isTemporary = Date.now() - this.lastDrawnTime <= this.drawingInterval
            && closestNode?.dataId.toString() == this.lastNodeId;
        //If the point is permanent --> update last drawn time and last node
        if (!isTemporary) {
            this.lastDrawnTime = Date.now();
            this.lastNodeId = closestNode?.dataId.toString();
        }
        //Add point
        this.currentFlow?.addPoint(e.scaledPosition, closestNode?.dataId, isTemporary);

    }

    public dragEnd() {
        //Drag end --> end the flow and clear current reference
        this.endAndClear();
    }

    private endAndClear() {
        this.currentFlow.endFlow();
        this.currentFlowId = null;
        this.lastNodeId = null;
    }
}