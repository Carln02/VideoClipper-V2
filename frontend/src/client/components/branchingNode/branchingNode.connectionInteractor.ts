import {ClosestOrigin, DefaultEventName, TurboDragEvent, TurboEvent, TurboInteractor} from "turbodombuilder";
import {ToolType} from "../../directors/project/project.types";
import {BranchingNode} from "./branchingNode";
import {BranchingNodeModel} from "./branchingNode.model";
import {BranchingNodeView} from "./branchingNode.view";
import {FlowPoint} from "../flow/flow.types";
import {ConnectionTool} from "../../tools/connection/connection";

export class BranchingNodeConnectionInteractor extends TurboInteractor<ToolType, BranchingNode, BranchingNodeView, BranchingNodeModel> {
    public tool = ToolType.connection;

    public propagateUp = {
        [DefaultEventName.move]: true,
        [DefaultEventName.dragEnd]: true,
    };

    private async initializeFlow(e: TurboEvent, tool: ConnectionTool) {
        //Reset drawing time
        tool.lastDrawnTime = Date.now();
        //Save closest node
        const closestNode: BranchingNode = e.closest(BranchingNode, true, ClosestOrigin.position);
        //If clicking on a node
        //Set last node ID
        tool.lastNodeId = closestNode.dataId;
        //Find first flow intersection with this node
        let intersection: FlowPoint;
        for (const flow of this.element.director.flows) {
            intersection = flow.findNodeEntry(tool.lastNodeId);
            if (intersection) break;
        }

        //If intersection found
        if (intersection && intersection.flowId != undefined) {
            //Assign flow ID
            tool.currentFlowId = intersection.flowId;
            //Create a new branch at this node
            return await tool.currentFlow.branchAtPoint(intersection, e.scaledPosition, tool.lastNodeId);
        }

        //Otherwise --> create a new flow
        tool.currentFlowId = await this.element.director.createNewFlow(e.scaledPosition, tool.lastNodeId,"#439045");

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
    public click(e: TurboEvent, tool: ConnectionTool) {
        tool.lastNodeId = this.element.dataId;
        //If no current flow --> try to initialize one
        if (!tool.currentFlow) return this.initializeFlow(e, tool);
        //Add a point to this flow, with the closestNode's ID
        tool.currentFlow.addPoint(e.scaledPosition, tool.lastNodeId);
    }

    public dragStart(e: TurboDragEvent, tool: ConnectionTool) {
        //Return if already creating/editing a flow
        if (tool.currentFlowId) return;
        this.initializeFlow(e, tool);
    }

    //On drag --> draw flow
    public drag(e: TurboDragEvent, tool: ConnectionTool) {
        //Return if no current flow
        if (!tool.currentFlow || !tool.currentFlow.currentBranch) return;
        //Check if drawing a temporary or permanent point
        //If drawing into a new node --> ignore interval and add a point. This ensures that when a user hits a
        // new node, it is added to the flow
        const isTemporary = Date.now() - tool.lastDrawnTime <= tool.drawingInterval
            && this.element.dataId == tool.lastNodeId;
        //If the point is permanent --> update last drawn time and last node
        if (!isTemporary) {
            tool.lastDrawnTime = Date.now();
            tool.lastNodeId = this.element.dataId;
        }

        console.log(tool.lastNodeId);
        //Add point
        tool.currentFlow?.addPoint(e.scaledPosition, this.element.dataId, isTemporary);

    }
}