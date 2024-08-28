import {Point} from "turbodombuilder";
import {Flow} from "../../flow";
import {FlowPoint, SyncedFlowBranch, SyncedFlowEntry} from "../../flow.types";
import {FlowHandler} from "../flow.handler";

export class FlowManagementHandler extends FlowHandler {
    /**
     * @description Updates all impacted flows after the node of the provided ID was moved by deltaPosition.
     * @param nodeId
     * @param deltaPosition
     */
    public static updateFlowsAfterMovingNode(nodeId: string, deltaPosition: Point) {
        if (!nodeId) return;

        //Get all flows' data and loop on them
        Flow.getAll().forEach(flow => {
            flow.utilities.reverseLoopOnFlowEntries((entry: SyncedFlowEntry) => {
                if (entry.startNodeId != nodeId && entry.endNodeId != nodeId) return;
                //If the flow entry represents points inside the node that has moved --> increment all points' coordinates
                // by deltaPosition
                if (entry.startNodeId == nodeId && entry.endNodeId == nodeId) {
                    entry.points.forEach(p => {
                        p.x += deltaPosition.x;
                        p.y += deltaPosition.y;
                    });
                }
                    //Otherwise --> the entry corresponds to points connecting the moved node with another node. Thus, I move each
                    //point by deltaPosition multiplied by a moveFactor (linearly interpolated based on the number of points and
                // how close the current point is from the moved node) for a natural-looking update of the flow
                else {
                    for (let i = 0; i < entry.points.length; i++) {
                        //Compute interpolation amount (both sides incremented by 1 to soften the effect)
                        let moveFactor = i / entry.points.length;
                        //Flip interpolation if points start from the given node (as then it should start high and end low)
                        if (entry.startNodeId == nodeId) moveFactor = 1 - moveFactor;
                        //Update accordingly the point's coordinates
                        entry.points[i].x += deltaPosition.x * moveFactor;
                        entry.points[i].y += deltaPosition.y * moveFactor;
                    }
                }
            });
        });
    }

    public static updateFlowsOnDetachingCard(cardId: string) {
        if (!cardId) return;

        // Get all flows' data and loop on them
        Flow.getAll().forEach(flow => {
            let changed = false;

            //TODO MAYBE HANDLE MERGING BRANCHES THAT WOULD NEED IT WHEN DETACHING CARD

            //Loop on all entries of this flow
            flow.utilities.reverseLoopOnFlowEntries(
                (entry: SyncedFlowEntry, branch: SyncedFlowBranch, entryIndex: number) => {
                    // If the entry is not connected to the card on any end --> skip it
                    if (entry.startNodeId != cardId && entry.endNodeId != cardId) return;
                    //Otherwise --> delete entry
                    branch.flowEntries.splice(entryIndex, 1);
                    changed = true;
                });

            //Attempt to delete unnecessary branches (or the flow if it is empty)
            flow.managementHandler.removeUnnecessaryBranchesOrFlow();
            //Return if flow was deleted
            if (!flow) return;

            //If changed, optimize the flow and save the new flow data
            if (!changed) return;
            flow.branchingHandler.optimizeBranches();
        });
    }

    /**
     * @description Ends the flow with the given ID by removing
     * @param id
     * @param data
     * @param save
     */
    public endFlow() {
        if (!this.flow) return;

        //Clear temporary point
        this.flow.drawingHandler.temporaryPoint = null;

        const currentBranch = this.currentBranch;
        const flowEntries = currentBranch?.flowEntries;

        //If flow ends with an entry that doesn't have an end node --> the flow was stopped outside a node --> remove
        //the last entry and save
        if (currentBranch && !flowEntries[flowEntries.length - 1]?.endNodeId) {
            flowEntries.splice(flowEntries.length - 1, 1);
        }
        //If branch is temporary --> overwrite target branch
        if (currentBranch && currentBranch.overwriting != undefined)
            this.flow.branchingHandler.overwriteBranch(currentBranch.overwriting, this.currentBranchIndex);
        //Clean up the flow
        this.removeUnnecessaryBranchesOrFlow();
        //If data null (the flow was deleted) --> return
        if (!this.flowData) return;
        //Optimize it
        this.flow.branchingHandler.optimizeBranches();

        flowEntries.forEach((flowEntry, index) => {
            console.log("FlowEntry " + index + ", startNodeId: " + flowEntry.startNodeId + ", endNodeId: " + flowEntry.endNodeId);
        });
    }

    /**
     * @description Removes the branches in the flow with the given ID if they don't represent a path that at least
     * connects two nodes, and removes the flow if it is empty.
     * @param id
     * @param data
     * @param save
     */
    public removeUnnecessaryBranchesOrFlow() {
        // Iterate over flowBranches in reverse order
        for (let branchIndex = this.flowBranches?.length - 1; branchIndex >= 0; branchIndex--) {
            const branch = this.flowBranches[branchIndex];
            //If less than 2 entries in the branch
            if (branch.flowEntries.length < 2
                //Or 2 entries in the branch
                || (branch.flowEntries.length == 2
                    //That do not each belong to a node
                    && (branch.flowEntries[0].startNodeId != branch.flowEntries[0].endNodeId
                        || branch.flowEntries[1].startNodeId != branch.flowEntries[1].endNodeId))) {
                //Remove branch
                this.flow.branchingHandler.removeBranch(branchIndex);
            }
        }

        // Delete the flow if it has no branches
        if (this.flowBranches.length == 0) {
            this.flow.delete();
            return null;
        }
    }

    public getPathsFromNode(nodeId: string) {
        if (!this.flow) return;
        const entries: FlowPoint[] = this.flow.searchHandler.findNodeEntries(nodeId);

        const paths: number[][] = [];
        const recurGetPath = (path: number[]): void => {
            const childIndices = this.flowBranches[path.length - 1]?.childBranches || [];
            if (childIndices.length == 0) {
                if (path.length > 0) paths.push([...path]);
                return;
            }
            for (const index of childIndices) recurGetPath([...path, index]);
        }

        entries.forEach(entry => recurGetPath([entry.branchIndex]));
        return paths;
    }
}