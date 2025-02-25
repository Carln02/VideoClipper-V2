import {Coordinate} from "turbodombuilder";
import {
    FlowPoint,
    NamedFlowPath, NamedFlowPathData,
    SyncedFlowBranch,
    SyncedFlowEntryData,
    SyncedFlowTag
} from "../../flow.types";
import {FlowHandler} from "../flow.handler";
import {BranchingNode} from "../../../branchingNode/branchingNode";
import {YCoordinate, YProxiedArray} from "../../../../../../yProxy";

export class FlowBranchingHandler extends FlowHandler {
    /**
     * @description Branches the flow with the given ID at the provided point, cutting the original flow into two
     * branches at this point's flow entry, and creating a new branch starting from the point's flow entry with all
     * the points up to the target.
     * @param p
     * @param branchPosition
     * @param nodeId
     * @param createThirdBranch
     * @param isOverwritingSibling
     */
    public async branchAtPoint(p: FlowPoint, branchPosition?: Coordinate, nodeId?: string,
                               createThirdBranch: boolean = true, isOverwritingSibling: boolean = false) {
        if (!this.flow || !p || p.branchIndex == undefined || p.entryIndex == undefined) return;

        //Get parent branch
        const parentBranch: SyncedFlowBranch = this.flowData.flowBranches[p.branchIndex];

        //Get static copy of the split entry
        let splitEntry: SyncedFlowEntryData = parentBranch.flowEntries[p.entryIndex].value;

        //Boolean indicating whether the branch occurs on an existing node
        const branchOnNode = nodeId != undefined
            || (!branchPosition && splitEntry.startNodeId == splitEntry.endNodeId);

        //Get last node ID
        if (!nodeId) nodeId = p.lastNodeId;

        //If not splitting on node --> create one
        if (!branchOnNode) {
            //Get split point index and split point
            const splitPointIndex = p.pointIndex != undefined ? p.pointIndex : splitEntry.points.length - 1;
            const splitPoint: Coordinate = {...splitEntry.points[splitPointIndex]};
            //Update last node ID
            // nodeId = await BranchingNode.create({origin: branchPosition ? branchPosition : splitPoint});

            if (splitEntry.startNodeId == splitEntry.endNodeId) {
                splitEntry = {
                    startNodeId: nodeId,
                    endNodeId: nodeId,
                    points: [branchPosition ? branchPosition : splitPoint]
                };
                //Add them to the branch, deleting the previous split entry
                parentBranch.flowEntries.splice(p.entryIndex, 0, splitEntry);
            } else {
                //Generate new entries before and after the new split entry
                const beforeSplitEntry: SyncedFlowEntryData = {
                    startNodeId: splitEntry.startNodeId,
                    endNodeId: nodeId,
                    points: structuredClone(splitEntry.points.slice(0, splitPointIndex + 1))
                };
                const afterSplitEntry: SyncedFlowEntryData = {
                    startNodeId: nodeId,
                    endNodeId: splitEntry.endNodeId,
                    points: structuredClone(splitEntry.points.slice(splitPointIndex))
                };
                if (branchPosition) {
                    beforeSplitEntry.points.push(branchPosition);
                    afterSplitEntry.points.splice(0, 1, branchPosition);
                }

                //Update split entry
                splitEntry = {
                    startNodeId: nodeId,
                    endNodeId: nodeId,
                    points: [branchPosition ? branchPosition : splitPoint]
                };

                //Add them to the branch, deleting the previous split entry
                parentBranch.flowEntries.splice(p.entryIndex, 1, beforeSplitEntry, splitEntry, afterSplitEntry);
                //Update FlowPoint data
                p.entryIndex++;
                p.pointIndex = 0;
            }
        } else {
            p.pointIndex = splitEntry.points.length < 2 ? 0 : Math.floor(splitEntry.points.length / 2);
        }

        //Update last node
        this.lastNode = nodeId;

        //Compute entries of the first child branch (include all entries of the parent starting from the split index)
        const firstChildEntries = parentBranch.flowEntries.slice(p.entryIndex);
        //Remove points before pointIndex from the first entry

        if (branchOnNode) firstChildEntries[0].points =
            (firstChildEntries[0].points?.slice(p.pointIndex) || []) as YProxiedArray<YCoordinate>;

        const firstChildIndex = this.flowBranches.length;
        //Add first child branch (make sure it is a clone so referenced entries/points are not shared with other branches)
        this.flowBranches.push({flowEntries: firstChildEntries, childBranches: []});
        this.flowBranches[p.branchIndex].childBranches.push(firstChildIndex);

        this.utilities.loopOnFlowTagEntries((namedPath) => {
            const parentPositionIndex = namedPath.branchIndices.indexOf(p.branchIndex);
            if (parentPositionIndex >= 0) namedPath.branchIndices.splice(parentPositionIndex, 0, firstChildIndex);
        });

        //Clean up branches
        this.flow.managementHandler.removeUnnecessaryBranchesOrFlow();

        //If creating a third branch -->
        if (createThirdBranch) {
            // Create the second child branch
            const secondChildIndex = this.flowBranches.length;
            this.flowBranches.push({
                overwriting: isOverwritingSibling ? this.flowBranches.length - 1 : undefined,
                //Create the entries of the second child branch
                flowEntries: [{
                    ...splitEntry,
                    points: [splitEntry.points[p.pointIndex]],
                }],
                childBranches: []
            });
            this.flowBranches[p.branchIndex].childBranches.push(secondChildIndex);

            const newNamedPaths = new Map<SyncedFlowTag, YProxiedArray<NamedFlowPath, NamedFlowPathData>>();
            this.utilities.loopOnFlowTagEntries((namedPath, tag) => {
                const parentPositionIndex = namedPath.branchIndices.indexOf(p.branchIndex);
                if (parentPositionIndex < 0) return;
                const nextIndex = this.utilities.findNextTagNameIndex(namedPath.name);
                if (!newNamedPaths.get(tag)) newNamedPaths.set(tag, [] as YProxiedArray<NamedFlowPath>);
                newNamedPaths.get(tag).push({
                    name: namedPath.name,
                    index: nextIndex,
                    branchIndices: [...namedPath.branchIndices.slice(0, parentPositionIndex + 1), secondChildIndex]
                });
            });

            newNamedPaths.forEach((namedPaths, tag) => tag.namedPaths.push(...namedPaths));

            //Remove the split entries from the parent branch
            parentBranch.flowEntries.splice(p.entryIndex);

            //Optimize
            this.optimizeBranches();

            //Update flow's current branch ID
            this.currentBranchIndex = this.flowBranches.length - 1;
        } else {
            //Update flow's current branch ID if it was active
            if (this.currentBranchIndex == p.branchIndex) this.currentBranchIndex = this.flowBranches.length - 1;
            //Remove the split entries from the parent branch
            parentBranch.flowEntries.splice(p.entryIndex);
        }

        if (branchOnNode) {
            const lastParentEntry = parentBranch.flowEntries[parentBranch.flowEntries.length - 1];
            lastParentEntry.points.splice(p.pointIndex);
        }
    }

    /**
     * @description Overwrites an old branch with a new branch, making sure to complete the new branch with any of
     * the old branch's relevant entries
     * @param id
     * @param oldBranchIndex
     * @param newBranchIndex
     * @param data
     * @param save
     */
    public overwriteBranch(oldBranchIndex: number, newBranchIndex: number) {
        //Get branches
        const oldBranch = this.flowBranches[oldBranchIndex];
        const newBranch = this.flowBranches[newBranchIndex];
        //Clear overwriting
        newBranch.overwriting = undefined;

        //Find entry in the old branch that passes through the new branch's ending node
        const nodeEntry = this.flow.searchHandler.findNodeEntryInBranch(oldBranchIndex,
            newBranch.flowEntries[newBranch.flowEntries.length - 1].startNodeId);
        //If found --> append all entries after this point to the new branch
        if (nodeEntry) newBranch.flowEntries.push(...oldBranch.flowEntries.slice(nodeEntry.entryIndex + 1));
        //TODO UPDATE FLOW TAGS

        //Remove old branch and save
        this.removeBranch(oldBranchIndex);
    }

    /**
     * @description Removes the provided branch and updates the data accordingly
     * @param branchIndex
     */
    public removeBranch(branchIndex: number) {
        //Get parent indices of removed branch
        const parentIndices = [];
        if (!this.flowBranches) return;

        this.flowBranches.forEach((branch, index) => {
            if (branch.childBranches.includes(branchIndex)) parentIndices.push(index);
        });
        //Get child indices of removed branch
        const childIndices = this.flowBranches[branchIndex].childBranches;

        //If removed branch was the current one --> set current branch to one of its parents
        if (this.currentBranchIndex == branchIndex)
            this.currentBranchIndex = parentIndices.length > 0 ? parentIndices[0] : 0;

        //Delete branch
        this.flowBranches.splice(branchIndex, 1);

        //Update connections
        parentIndices.forEach(parentIndex =>
            childIndices.forEach(childIndex => {
                if (!this.flowBranches[parentIndex].childBranches.includes(childIndex))
                    this.flowBranches[parentIndex].childBranches.push(childIndex);
            }));

        //Update all branches' indices accordingly
        this.flowBranches.forEach(branch => {
            for (let i = branch.childBranches.length - 1; i >= 0; i--) {
                if (branch.childBranches[i] > branchIndex) branch.childBranches[i]--;
                if (branch.childBranches[i] == branchIndex) branch.childBranches.splice(i, 1);
            }
        });
    }

    /**
     * @description Optimizes the branches in the flow by merging branches that end on a node and start on the same node
     * without other branches reaching that node, and creating new branches when more than 2 lines reach a node.
     */
    public optimizeBranches() {
        return;
        if (!this.flow) return;

        const branchReachCount: Map<string, number> = new Map<string, number>();

        //Count how many flow entries reach each node
        this.utilities.reverseLoopOnFlowEntries(entry => {
            if (!entry.endNodeId || entry.startNodeId != entry.endNodeId) return;
            branchReachCount.set(entry.endNodeId, (branchReachCount.get(entry.endNodeId) || 0) + 1);
        });

        //Merge branches
        for (let branchIndex = this.flowBranches?.length - 1; branchIndex >= 0; branchIndex--) {
            //Get branch and its first entry
            const branch = this.flowBranches[branchIndex];
            const firstEntry = branch.flowEntries[0];

            //If first entry's node has 2 entries reaching it
            if (firstEntry && firstEntry.startNodeId && branchReachCount.get(firstEntry.startNodeId) == 2) {
                //Find (if any) the index of the branch that ends at this node
                const previousBranchIndex = this.flowBranches.findIndex((b, index) =>
                    b.flowEntries[b.flowEntries.length - 1]?.endNodeId == firstEntry.startNodeId && index != branchIndex
                );

                //If not found --> return
                if (previousBranchIndex == -1) continue;
                //Otherwise --> get the branch
                const previousBranch = this.flowBranches[previousBranchIndex];
                //Add to it the initial branch's data
                previousBranch.flowEntries.push(...structuredClone(branch.flowEntries.slice(1)));
                //Delete the initial branch
                this.removeBranch(branchIndex);
            }
        }

        //Create new branches when more than 2 lines reach a node
        branchReachCount.forEach((branchCount, nodeId) => {
            if (branchCount <= 2) return;
            //Loop on flow entries
            this.utilities.reverseLoopOnFlowEntries((entry, branch,
                                                      entryIndex, branchIndex) => {
                //Skip if it's not a node entry or the node is not the target
                if (entry.startNodeId != entry.endNodeId || entry.startNodeId != nodeId) return;
                //Skip if the entry is at the beginning or the end of the flow
                if (entryIndex == 0 || entryIndex == branch.flowEntries.length - 1) return;
                //Split the branch into two at the node entry
                this.branchAtPoint({
                    flowId: this.flow.dataId.toString(),
                    branchIndex: branchIndex,
                    entryIndex: entryIndex,
                    lastNodeId: nodeId,
                }, undefined, nodeId, false, false);
            });
        });
    }
}
