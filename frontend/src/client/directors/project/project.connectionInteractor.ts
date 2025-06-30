import {TurboDragEvent, TurboInteractor} from "turbodombuilder";
import {ToolType} from "./project.types";
import {Project} from "./project";
import {ProjectView} from "./project.view";
import {ProjectModel} from "./project.model";
import {ConnectionTool} from "../../tools/connection/connection";

export class ProjectConnectionInteractor extends TurboInteractor<ToolType, Project, ProjectView, ProjectModel> {
    public tool = ToolType.connection;

    //On click --> create a point if the click is inside a node, otherwise cancel flow
    public click(_, tool: ConnectionTool) {
        this.endAndClear(tool);
    }

    public move(e: TurboDragEvent, tool: ConnectionTool) {
        tool.currentFlow?.addPoint(e.scaledPosition, true);
    }

    //On drag --> draw flow
    public drag(e: TurboDragEvent, tool: ConnectionTool) {
        //Return if no current flow
        if (!tool.currentFlow || !tool.currentEntry) return;
        //Check if drawing a temporary or permanent point
        //If drawing into a new node --> ignore interval and add a point. This ensures that when a user hits a
        // new node, it is added to the flow
        const isTemporary = Date.now() - tool.lastDrawnTime <= tool.drawingInterval;
        //If the point is permanent --> update last drawn time and last node
        if (!isTemporary) {
            tool.lastDrawnTime = Date.now();
            tool.lastNodeId = null;
        }
        //Add point
        tool.currentFlow?.addPoint(e.scaledPosition, isTemporary);
    }

    public dragEnd(_, tool: ConnectionTool) {
        //Drag end --> end the flow and clear current reference
        this.endAndClear(tool);
    }

    private endAndClear(tool: ConnectionTool) {
        tool.currentEntry.endEntry();
        tool.currentFlowId = null;
        tool.lastNodeId = null;
    }
}