import {Point, TurboHandler} from "turbodombuilder";
import {FlowBranchModel} from "./flowBranch.model";
import {FlowEntryModel} from "../flowEntry/flowEntry.model";

export class FlowBranchPointHandler extends TurboHandler<FlowBranchModel> {
    /**
     * @description Adds the provided point to the flow with the given ID. The node ID indicates the ID of the node
     * the point is in (or null), and isTemporary indicates whether the point is temporarily added to the flow as
     * part of user feedback (to not add it to the synced data).
     * @param p
     * @param nodeId
     * @param isTemporary
     */
    public addPoint(p: Point, nodeId ?: string, isTemporary: boolean = false) {
        if (!p) return;

        //If isTemporary --> set temporary point and return
        if (isTemporary) {
            this.model.temporaryPoint = p;
            return;
        }

        //Clear temporary point and update flow's lastNode
        this.model.temporaryPoint = null;
        this.model.lastNode = nodeId;

        //Get data and flow entries (for ease of use)
        const flowEntries = this.model.flowEntriesArray;

        //Create an entry if none exist
        if (flowEntries.length == 0) {
            if (!nodeId) return;
            this.model.entryHandler.addNewEntry({startNodeId: nodeId, endNodeId: nodeId});
        }

        //Get last entry
        const currentEntry = new FlowEntryModel(flowEntries[flowEntries.length - 1]);

        //Now adding the point...

        //Point inside of same last node --> just add it
        if (currentEntry.startNodeId == nodeId && currentEntry.endNodeId == nodeId) currentEntry.addPoint(p);

        //Otherwise, if point in a new node --> add a flow entry starting and ending at that node, as well as the point
        else if (nodeId) {
            if (!currentEntry.endNodeId) currentEntry.endNodeId = nodeId;
            this.model.entryHandler.addNewEntry({startNodeId: nodeId, endNodeId: nodeId, points: [p.object]});
        }
        //Otherwise (point outside a node)
        else {
            //Last entry doesn't have an end node --> entry connects two nodes (the second is still unknown) --> just
            //add the point as part of the entry
            if (!currentEntry.endNodeId) currentEntry.addPoint(p);
                //Otherwise --> create a new entry that connects the last node and a future unknown node, and add to
            //it the point
            else this.model.entryHandler.addNewEntry({startNodeId: currentEntry.endNodeId, points: [p.object]});
        }
    }
}