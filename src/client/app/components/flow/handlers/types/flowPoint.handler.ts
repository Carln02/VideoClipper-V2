import {Point} from "turbodombuilder";
import {FlowHandler} from "../flow.handler";

export class FlowPointHandler extends FlowHandler {
    /**
     * @description Adds the provided point to the flow with the given ID. The node ID indicates the ID of the node
     * the point is in (or null), and isTemporary indicates whether the point is temporarily added to the flow as
     * part of user feedback (to not add it to the synced data).
     * @param p
     * @param nodeId
     * @param isTemporary
     */
    public addPoint(p: Point, nodeId?: string, isTemporary: boolean = false) {
        if (!this.flow || !p) return;

        //If isTemporary --> set temporary point and return
        if (isTemporary) {
            this.flow.drawingHandler.temporaryPoint = p;
            return;
        }

        //Clear temporary point and update flow's lastNode
        this.flow.drawingHandler.temporaryPoint = null;
        this.lastNode = nodeId;

        //Get data and flow entries (for ease of use)
        const flowEntries = this.currentBranch.flowEntries;

        //Create an entry if none exist
        if (flowEntries.length == 0) {
            if (!nodeId) return;
            flowEntries.push({startNodeId: nodeId, endNodeId: nodeId, points: []});
        }

        //Get last entry
        const currentEntry = flowEntries[flowEntries.length - 1];

        //Now adding the point...

        //Point inside of same last node --> just add it
        if (currentEntry.startNodeId == nodeId && currentEntry.endNodeId == nodeId) {
            currentEntry.points.push(p.object);
        }
        //Otherwise, if point in a new node --> add a flow entry starting and ending at that node, as well as the point
        else if (nodeId) {
            if (!currentEntry.endNodeId) currentEntry.endNodeId = nodeId;
            flowEntries.push({startNodeId: nodeId, endNodeId: nodeId, points: [p.object]});
        }
        //Otherwise (point outside a node)
        else {
            //Last entry doesn't have an end node --> entry connects two nodes (the second is still unknown) --> just
            //add the point as part of the entry
            if (!currentEntry.endNodeId) currentEntry.points.push(p.object);
                //Otherwise --> create a new entry that connects the last node and a future unknown node, and add to
            //it the point
            else flowEntries.push({startNodeId: currentEntry.endNodeId, points: [p.object]});
        }
    }
}