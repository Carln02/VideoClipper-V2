import {FlowHandler} from "../flow.handler";
import {FlowPoint, SyncedFlowBranch, SyncedFlowEntry} from "../../flow.types";
import {Flow} from "../../flow";
import {Coordinate, Point} from "turbodombuilder";

//DONE
export class FlowSearchHandler extends FlowHandler {
    /**
     * @function findNodeEntryInFlows
     * @static
     * @description Loops on all flows and finds the first flow entry that is inside the node with the given ID.
     * @param {string} nodeId - The ID of the node.
     * @returns {FlowPoint} - The first flow entry that is inside the node with given ID.
     */
    public static findNodeEntryInFlows(nodeId: string): FlowPoint {
        for (const flow of Flow.getAll()) {
            const nodeEntry = flow.searchHandler.findNodeEntry(nodeId);
            if (nodeEntry) return nodeEntry;
        }
        return null;
    }

    /**
     * @function findNodeEntry
     * @description Finds the first flow entry inside the given node's ID.
     * @param {string} nodeId - The ID of the node.
     * @returns {FlowPoint} - The first flow entry that is inside the node with given ID.
     */
    public findNodeEntry(nodeId: string): FlowPoint {
        //Loop on branches
        for (let i = 0; i < this.flowBranches.length; i++) {
            const nodeEntry = this.findNodeEntryInBranch(i, nodeId);
            if (nodeEntry) return nodeEntry;
        }
        return null;
    }

    /**
     * @description Finds the last flow entry inside the given node's ID
     * @param nodeId
     */
    public findNodeEntries(nodeId: string): FlowPoint[] {
        const results = [];
        //Loop on branches
        for (let i = 0; i < this.flowBranches.length; i++) {
            const nodeEntry = this.findNodeEntryInBranch(i, nodeId);
            if (nodeEntry) results.push(nodeEntry);
        }
        return results;
    }

    /**
     * @description Finds the last flow entry inside the given node's ID
     * @param branchIndex
     * @param nodeId
     */
    public findNodeEntryInBranch(branchIndex: number, nodeId: string): FlowPoint {
        const flowEntries = this.flowBranches[branchIndex].flowEntries;
        if (!flowEntries) return null;

        //Loop on entries
        for (let entryIndex = 0; entryIndex < flowEntries.length; entryIndex++) {
            const entry = flowEntries[entryIndex];
            //If entry is inside the given node --> store it
            if (entry.startNodeId == nodeId && entry.endNodeId == nodeId) {
                return {
                    flowId: this.flow.dataId.toString(),
                    branchIndex: branchIndex,
                    entryIndex: entryIndex,
                    lastNodeId: entry.startNodeId
                };
            }
        }

        return null;
    }

    /**
     * @description Finds the closest point in the flow to the given point
     * @param id
     * @param point
     */
    public findClosestPoint(point: Point): FlowPoint {
        //Initialize closest point data and minimum distance
        let closestPoint: FlowPoint = {};
        let minDistance = Infinity;
        //Loop on all entries of the flow
        this.utilities.reverseLoopOnFlowEntries((entry: SyncedFlowEntry, branch: SyncedFlowBranch,
                                                           entryIndex: number, branchIndex: number) => {
            //Loop on points
            entry.points.forEach((p: Coordinate, index: number) => {
                //Compute distance
                const distance = Point.dist(p, point);
                //If smaller --> update the closest point and save new distance
                if (distance < minDistance) {
                    closestPoint = {
                        branchIndex: branchIndex,
                        entryIndex: entryIndex,
                        lastNodeId: entry.startNodeId,
                        pointIndex: index
                    };
                    minDistance = distance;
                }
            })
        });
        return closestPoint;
    }

    public findPointDataFromIndex(branchIndex: number, index: number): FlowPoint {
        let count = 0;
        let pointData: FlowPoint;

        this.utilities.loopOnBranchEntries(branchIndex,
            (entry: SyncedFlowEntry, entryIndex: number) => {
                if (count < 0) return;
                if (count + entry.points.length < index) {
                    count += entry.points.length;
                    return;
                }

                pointData = {
                    flowId: this.flow.dataId.toString(),
                    branchIndex: branchIndex,
                    entryIndex: entryIndex,
                    lastNodeId: entry.startNodeId,
                    pointIndex: index - count
                };
                count = -1;
            });
        return pointData;
    }
}