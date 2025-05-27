import {Point, TurboHandler} from "turbodombuilder";
import {FlowBranchModel} from "./flowBranch.model";


export class FlowBranchUpdateHandler extends TurboHandler<FlowBranchModel> {
    /**
     * @description Updates all impacted flows after the node of the provided ID was moved by deltaPosition.
     * @param nodeId
     * @param deltaPosition
     */
    public updateAfterMovingNode(nodeId: string, deltaPosition: Point) {
        if (!nodeId) return;

        const flowEntries = this.model.entries;

        for (let i = 0; i < flowEntries.length; i++) {
            const entry = flowEntries[i];
            const points = entry.points;

            if (entry.startNodeId != nodeId && entry.endNodeId != nodeId) continue;

            //If the flow entry represents points inside the node that has moved --> increment all points' coordinates
            // by deltaPosition
            if (entry.startNodeId == nodeId && entry.endNodeId == nodeId) {
                points.forEach((_, index) => entry.incrementPoint(index, deltaPosition));
            }
                //Otherwise --> the entry corresponds to points connecting the moved node with another node. Thus, I move each
                //point by deltaPosition multiplied by a moveFactor (linearly interpolated based on the number of points and
            // how close the current point is from the moved node) for a natural-looking update of the flow
            else {
                for (let i = 0; i < points.length; i++) {
                    //Compute interpolation amount (both sides incremented by 1 to soften the effect)
                    let moveFactor = i / points.length;
                    //Flip interpolation if points start from the given node (as then it should start high and end low)
                    if (entry.startNodeId == nodeId) moveFactor = 1 - moveFactor;
                    //Update accordingly the point's coordinates
                    entry.incrementPoint(i, deltaPosition.mul(moveFactor))
                }
            }
        }
    }

    public updateOnDetachingNode(nodeId: string): boolean {
        if (!nodeId) return;

        const flowEntries = this.model.entries;
        for (let i = flowEntries.length - 1; i >= 0; i--) {
            const entry = flowEntries[i];
            // If the entry is not connected to the card on any end --> skip it
            if (entry.startNodeId != nodeId && entry.endNodeId != nodeId) continue;
            //Otherwise --> delete entry
            this.model.entryHandler.removeEntryAt(i);
            return true;
        }
        return false;
    }
}