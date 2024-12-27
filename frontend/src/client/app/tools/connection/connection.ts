import {Tool} from "../tool/tool";
import {ClosestOrigin, define, TurboDragEvent, TurboEvent} from "turbodombuilder";
import {ToolType} from "../../managers/toolManager/toolManager.types";
import {BranchingNode} from "../../components/branchingNode/branchingNode";
import {Flow} from "../../components/flow/flow";
import {FlowIntersectionHandler} from "../../components/flow/handlers/types/flowIntersection.handler";
import {FlowSearchHandler} from "../../components/flow/handlers/types/flowSearch.handler";

/**
 * @description Tool that handles creating flows and connecting nodes
 */
@define("connection-tool")
export class ConnectionTool extends Tool {
    private currentFlow: Flow;
    private lastNodeId: string = null;

    //Interval indicating the frequency at which points are permanently added to the flow
    //A higher value will increase the smoothing effect of the flow
    private readonly drawingInterval: number = 150 as const;
    //The last time a point was added permanently (used for when drawing flows)
    private lastDrawnTime: number = 0;

    constructor() {
        super(ToolType.connection);
    }

    private async initializeFlow(e: TurboEvent) {
        //Reset drawing time
        this.lastDrawnTime = Date.now();
        //Save closest node
        const closestNode: BranchingNode = e.closest(BranchingNode);
        //If clicking on a node
        if (closestNode) {
            //Set last node ID
            this.lastNodeId = closestNode.id;
            //Find first flow intersection with this node
            const intersection = FlowSearchHandler.findNodeEntryInFlows(closestNode.id);
            //If intersection found
            if (intersection && intersection.flowId != undefined) {
                //Assign flow ID
                this.currentFlow = Flow.getById(intersection.flowId);
                //Create a new branch at this node
                return this.currentFlow.branchingHandler.branchAtPoint(intersection, undefined, this.lastNodeId);
            }
            //Otherwise --> create a new flow
            this.currentFlow = await Flow.create(e.scaledPosition, this.lastNodeId);
            return;
        }
        //Otherwise --> get the point data (if any) that the user initiated the drag from
        const closestPoint = FlowIntersectionHandler.flowIntersectingWithPoint(e.scaledPosition);
        //Return if null
        if (!closestPoint || !closestPoint.flowId) return;

        this.currentFlow = Flow.getById(closestPoint.flowId);
        //Update last node ID
        this.lastNodeId = closestPoint.lastNodeId;
        //Branch (temporarily) at point to later update the original path
        return this.currentFlow.branchingHandler.branchAtPoint(closestPoint, e.scaledPosition,
            undefined, true, true);
    }

    //On click --> create a point if the click is inside a node, otherwise cancel flow
    public clickAction(e: TurboEvent) {
        //Get the closest node to the event's target
        const closestNode = e.closest(BranchingNode);
        //Otherwise --> store last node ID
        if (closestNode) this.lastNodeId = closestNode.id;
        //If no current flow --> try to initialize one
        if (!this.currentFlow) return this.initializeFlow(e);

        //If clicked outside a node --> end current flow (if any) and return
        if (!closestNode) {
            this.currentFlow.managementHandler.endFlow();
            this.currentFlow = null;
            this.lastNodeId = null;
            return;
        }

        //Add a point to this flow, with the closestNode's ID
        this.currentFlow.pointHandler.addPoint(e.scaledPosition, this.lastNodeId);
    }

    public dragStart(e: TurboDragEvent) {
        //Return if already creating/editing a flow
        if (this.currentFlow) return;
        this.initializeFlow(e);
    }

    public moveAction(e: TurboDragEvent) {
        this.currentFlow?.pointHandler.addPoint(e.scaledPosition, null, true);
    }

    //On drag --> draw flow
    public dragAction(e: TurboDragEvent) {
        //Return if no current flow
        if (!this.currentFlow) return;
        //Get the closest node
        const closestNode = e.closest(BranchingNode, true, ClosestOrigin.position);
        //Check if drawing a temporary or permanent point
        //If drawing into a new node --> ignore interval and add a point. This ensures that when a user hits a
        // new node, it is added to the flow
        const isTemporary = Date.now() - this.lastDrawnTime <= this.drawingInterval
            && closestNode?.id == this.lastNodeId;
        //If the point is permanent --> update last drawn time and last node
        if (!isTemporary) {
            this.lastDrawnTime = Date.now();
            this.lastNodeId = closestNode?.id;
        }
        //Add point
        this.currentFlow.pointHandler.addPoint(e.scaledPositions.first, closestNode?.id, isTemporary);
    }

    public dragEnd() {
        //Drag end --> end the flow and set current reference to null
        this.currentFlow.managementHandler.endFlow();
        this.currentFlow = null;
    }
}