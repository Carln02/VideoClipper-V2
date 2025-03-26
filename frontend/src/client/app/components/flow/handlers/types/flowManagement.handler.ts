import {Coordinate, Point} from "turbodombuilder";
import {Flow} from "../../flow";
import {FlowPoint, SyncedFlowBranch, SyncedFlowEntry} from "../../flow.types";
import {FlowHandler} from "../flow.handler";

export class FlowManagementHandler extends FlowHandler {
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
        if (!currentBranch || !flowEntries) return;

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