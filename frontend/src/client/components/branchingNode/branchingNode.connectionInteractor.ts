import {DefaultEventName, MvcInteractorProperties, TurboDragEvent, TurboEvent, TurboInteractor} from "turbodombuilder";
import {ToolType} from "../../directors/project/project.types";
import {BranchingNode} from "./branchingNode";
import {BranchingNodeModel} from "./branchingNode.model";
import {BranchingNodeView} from "./branchingNode.view";
import {ConnectionTool} from "../../tools/connection/connection";
import {getClosestPointOnEdge, pointInsideRect} from "../../utils/computation";

export class BranchingNodeConnectionInteractor extends TurboInteractor<ToolType, BranchingNode, BranchingNodeView, BranchingNodeModel> {
    public tool = ToolType.connection;

    public target: HTMLElement;

    public propagateUp = {
        [DefaultEventName.move]: true,
        [DefaultEventName.dragEnd]: true,
    };

    public constructor(properties: MvcInteractorProperties<BranchingNode, BranchingNodeView, BranchingNodeModel>) {
        super(properties);
        requestAnimationFrame(() => this.target = this.element.querySelector("vc-playback"));
    }

    private async initializeFlow(e: TurboEvent, tool: ConnectionTool) {
        //Reset drawing time
        tool.lastDrawnTime = Date.now();
        tool.lastNodeId = this.element.dataId; //TODO MAYBE CRASHES - GO BACK TO e.closest()

        const existingFlow = this.element.director.flows.find(flow => flow.color === tool.color);

        if (existingFlow) {
            tool.currentFlowId = existingFlow.dataId;
            if (!existingFlow.hasNode(tool.lastNodeId)) existingFlow.createSelector(tool.lastNodeId);
        } else {
            tool.currentFlowId = await this.element.director.createNewFlow(e.scaledPosition, tool.lastNodeId, tool.color);
        }
    }

    //On click --> create a point if the click is inside a node, otherwise cancel flow
    public click(e: TurboEvent, tool: ConnectionTool) {
        tool.lastNodeId = this.element.dataId;
        //If no current flow --> try to initialize one
        if (!tool.currentFlow) return this.initializeFlow(e, tool);
        //Add a point to this flow, with the closestNode's ID
        tool.currentFlow.addPoint(e.scaledPosition);
    }

    public dragStart(e: TurboDragEvent, tool: ConnectionTool) {
        tool.clear();
        //Return if already creating/editing a flow
        if (tool.currentFlowId) return;
        this.initializeFlow(e, tool);
    }

    //On drag --> draw flow
    public drag(e: TurboDragEvent, tool: ConnectionTool) {
        //Return if no current flow
        if (!tool.currentFlow) return;

        //TODO: PROBLEM FOR LATER FIX THIS STUPID THING
        const cardRect = this.target.getBoundingClientRect();
        if (!pointInsideRect(e.position, cardRect, 0)) return;

        if (tool.currentEntry) {
            if (tool.currentEntry.startNodeId === this.model.dataId) return;
            const lastPoint = getClosestPointOnEdge(e.position, cardRect);
            //TODO USE CONSTRAINTS INSTEAD
            tool.currentEntry.addPoint(this.element.director.canvas.navigationManager.computePositionRelativeToCanvas(lastPoint));
            tool.currentEntry.endEntry(this.model.dataId);
        }

        tool.currentFlow.createEntry(this.model.dataId);

        // //Check if drawing a temporary or permanent point
        // //If drawing into a new node --> ignore interval and add a point. This ensures that when a user hits a
        // // new node, it is added to the flow
        // const isTemporary = Date.now() - tool.lastDrawnTime <= tool.drawingInterval
        //     && this.element.dataId == tool.lastNodeId;
        // //If the point is permanent --> update last drawn time and last node
        // if (!isTemporary) {
        //     tool.lastDrawnTime = Date.now();
        //     tool.lastNodeId = this.element.dataId;
        // }
        //
        // console.log(tool.lastNodeId);
        // //Add point
        // tool.currentFlow?.addPoint(e.scaledPosition, this.element.dataId, isTemporary);
    }
}