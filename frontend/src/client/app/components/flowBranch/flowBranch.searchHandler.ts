import {Coordinate, Point, TurboHandler} from "turbodombuilder";
import {FlowPoint} from "../flow/flow.types";
import {FlowEntryModel} from "../flowEntry/flowEntry.model";
import {FlowBranchModel} from "./flowBranch.model";

export class FlowBranchSearchHandler extends TurboHandler<FlowBranchModel> {
    /**
     * @description Finds the last flow entry inside the given node's ID
     * @param nodeId
     */
    public findNodeEntry(nodeId: string): FlowPoint {
        const flowEntries = this.model.entriesArray;
        if (!flowEntries) return null;

        //Loop on entries
        for (let entryIndex = 0; entryIndex < flowEntries.length; entryIndex++) {
            const entry = new FlowEntryModel(flowEntries[entryIndex]);
            //If entry is inside the given node --> store it
            if (entry.startNodeId == nodeId && entry.endNodeId == nodeId) {
                return {
                    flowId: this.model.flowId,
                    branchId: this.model.dataId,
                    entryIndex: entryIndex,
                    lastNodeId: entry.startNodeId
                };
            }
        }

        return null;
    }

    /**
     * @description Finds the last flow entry inside the given node's ID
     * @param nodeId
     */
    public findNodeEntries(nodeId: string): FlowPoint[] {
        const flowEntries = this.model.entriesArray;
        if (!flowEntries) return [];

        const results = [];

        //Loop on entries
        for (let entryIndex = 0; entryIndex < flowEntries.length; entryIndex++) {
            const entry = new FlowEntryModel(flowEntries[entryIndex]);
            //If entry is inside the given node --> store it
            if (entry.startNodeId == nodeId && entry.endNodeId == nodeId) {
                results.push({
                    flowId: this.model.flowId,
                    branchId: this.model.dataId,
                    entryIndex: entryIndex,
                    lastNodeId: entry.startNodeId
                });
            }
        }

        return results;
    }

    /**
     * @description Finds the closest point in the flow to the given point
     * @param point
     */
    public findClosestPoint(point: Point): FlowPoint {
        //Initialize closest point data and minimum distance
        let closestPoint: FlowPoint = null;
        let minDistance = Infinity;
        const flowEntries = this.model.entriesArray;

        //Loop on all entries of the flow
        for (let entryIndex = flowEntries.length - 1; entryIndex >= 0; entryIndex--) {
            const entry = new FlowEntryModel(flowEntries[entryIndex]);

            //Loop on points
            entry.points.forEach((p: Coordinate, index: number) => {
                //Compute distance
                const distance = Point.dist(p, point);
                //If smaller --> update the closest point and save new distance
                if (distance < minDistance) {
                    closestPoint = {
                        flowId: this.model.flowId,
                        branchId: this.model.dataId,
                        entryIndex: entryIndex,
                        lastNodeId: entry.startNodeId,
                        pointIndex: index
                    };
                    minDistance = distance;
                }
            })
        }

        return closestPoint;
    }

    public findPointFromIndex(index: number): FlowPoint {
        let count = 0;
        let pointData: FlowPoint = null;

        const flowEntries = this.model.entriesArray;
        for (let entryIndex = 0; entryIndex < flowEntries.length; entryIndex++) {
            const entry = new FlowEntryModel(flowEntries[entryIndex]);

            if (count + entry.points.length < index) {
                count += entry.points.length;
                continue;
            }

            pointData = {
                flowId: this.model.flowId,
                branchId: this.model.dataId,
                entryIndex: entryIndex,
                lastNodeId: entry.startNodeId,
                pointIndex: index - count
            };
            break;
        }

        return pointData;
    }
}