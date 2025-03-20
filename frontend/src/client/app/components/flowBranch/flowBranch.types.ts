import {YArray} from "../../../../yManagement/yManagement.types";
import {Flow} from "../flow/flow";
import {SyncedFlowEntry} from "../flowEntry/flowEntry.types";

/**
 * A branch is a sequential list of FlowEntries (edges) in the order they were created.
 * Each branch has a unique "branchId", so you can reference it from named paths.
 * "connectedBranches" is optional and can store the IDs of branches that split or merge.
 */
export type SyncedFlowBranch = {
    entries: YArray<SyncedFlowEntry>;
    connectedBranches?: YArray<string>;
    overwriting?: boolean;
};

export type FlowBranchProperties = {
    flow: Flow;
    data: SyncedFlowBranch;
}

