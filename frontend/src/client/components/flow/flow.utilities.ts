export class FlowUtilities {
    // /**
    //  * @description Takes a flow ID, loops on all its branches' entries and performs on each the provided callback
    //  * @param callback
    //  */
    // public reverseLoopOnFlowEntries(callback: (entry: SyncedFlowEntry, branch: SyncedFlowBranch,
    //                                                               entryIndex: number, branchIndex: number) => void) {
    //     if (!this.flow) return;
    //
    //     // Iterate over flowBranches in reverse order (to support deletion of entries)
    //     for (let branchIndex = this.flowData.flowBranches?.length - 1; branchIndex >= 0; branchIndex--) {
    //         const branch = this.flowData.flowBranches[branchIndex];
    //         // Iterate over flowEntries in reverse order
    //         for (let entryIndex = branch.flowEntries.length - 1; entryIndex >= 0; entryIndex--) {
    //             callback(branch.flowEntries[entryIndex], branch, entryIndex, branchIndex);
    //         }
    //     }
    // }
    //
    // public loopOnFlowTagEntries(callback: (namedPath: NamedFlowPath, tag: SyncedFlowTag) => void) {
    //     if (!this.flow) return;
    //
    //     const tags = this.flowData.flowTags;
    //     return;
    //     for (const tag of tags) {
    //         const namedPaths = tag.namedPaths;
    //         for (const namedPath of namedPaths) {
    //             callback(namedPath, tag);
    //         }
    //     }
    // }
    //
    // //TODO MOVE TO SEPARATE HANDLER
    // public findNextTagNameIndex(name: string) {
    //     if (!this.flow) return;
    //     let value = -1;
    //     const visitedPaths = new Set();
    //
    //     this.loopOnFlowTagEntries((namedPath) => {
    //         if (namedPath.name != name || visitedPaths.has(namedPath)) return;
    //         visitedPaths.add(namedPath);
    //         if (namedPath.index >= value) value = namedPath.index + 1;
    //     });
    //
    //     return value;
    // }
}