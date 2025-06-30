import {Point, TurboHandler} from "turbodombuilder";
import {FlowPoint} from "./flow.types";
import {FlowModel} from "./flow.model";

//DONE
export class FlowSearchHandler extends TurboHandler<FlowModel> {
    /**
     * @function findNodeEntry
     * @description Finds the first flow entry inside the given node's ID.
     * @param {string} nodeId - The ID of the node.
     * @returns {FlowPoint} - The first flow entry that is inside the node with given ID.
     */
    public findNodeEntry(nodeId: string): FlowPoint {
        for (const branch of this.model.branches) {
            const nodeEntry = branch.findNodeEntry(nodeId);
            if (nodeEntry) return nodeEntry;
        }
        return null;
    }

    /**
     * @description Finds the last flow entry inside the given node's ID
     * @param nodeId
     */
    public findNodeEntries(nodeId: string): FlowPoint[] {
        const entries = [];
        for (const branch of this.model.branches) entries.push(...branch.findNodeEntries(nodeId));
        return entries;
    }

    /**
     * @description Finds the closest point in the flow to the given point
     * @param id
     * @param point
     */
    public findClosestPoint(point: Point): FlowPoint {
        return {};
        //TODO
        //Initialize closest point data and minimum distance
        // let closestPoint: FlowPoint = {};
        // let minDistance = Infinity;
        //
        // //Loop on all entries of the flow
        // this.utilities.reverseLoopOnFlowEntries((entry: SyncedFlowEntry, branch: SyncedFlowBranch,
        //                                          entryIndex: number, branchIndex: number) => {
        //     //Loop on points
        //     entry.points.forEach((p: Coordinate, index: number) => {
        //         //Compute distance
        //         const distance = Point.dist(p, point);
        //         //If smaller --> update the closest point and save new distance
        //         if (distance < minDistance) {
        //             closestPoint = {
        //                 branchIndex: branchIndex,
        //                 entryIndex: entryIndex,
        //                 lastNodeId: entry.startNodeId,
        //                 pointIndex: index
        //             };
        //             minDistance = distance;
        //         }
        //     })
        // });
        // return closestPoint;
    }
}