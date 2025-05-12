import {Point, TurboHandler} from "turbodombuilder";
import {FlowBranchModel} from "./flowBranch.model";

export class FlowBranchPointHandler extends TurboHandler<FlowBranchModel> {
    /**
     * @description Adds the provided point to the flow with the given ID. The node ID indicates the ID of the node
     * the point is in (or null), and isTemporary indicates whether the point is temporarily added to the flow as
     * part of user feedback (to not add it to the synced data).
     * @param p
     * @param nodeId
     * @param isTemporary
     */
    public addPoint(p: Point, nodeId?: string, isTemporary: boolean = false) {
        if (!p) return;

        //If isTemporary --> set temporary point and return
        if (isTemporary) {
            this.model.temporaryPoint = p;
            return;
        }

        //Clear temporary point and update flow's lastNode
        this.model.temporaryPoint = null;
        this.model.lastNode = nodeId;

        //Create an entry if none exist
        if (this.model.entries.length == 0) {
            if (!nodeId) return;
            this.model.entryHandler.addNewEntry({startNodeId: nodeId, endNodeId: nodeId});
        }

        //Get last entry
        const currentEntry = this.model.entries[this.model.entries.length - 1];

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

    public getMaxPoint(): Point {
        let maxPoint = new Point();

        const points = this.model.points;
        if (!points || points.length == 0) return maxPoint;

        // Knowing that (0, 0) is at the center of the canvas, some points have negative coordinates,
        // so I get the max x and y absolute values in all the points to ensure I'm not ignoring negative values
        points.forEach(p => {
            if (!p || p.x == undefined || p.y == undefined) return;
            const max = Point.max(maxPoint, p.abs());
            if (isNaN(max.x) || isNaN(max.y)) return;
            maxPoint = max;
        });
        return maxPoint;
    }
}