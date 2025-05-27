import {YArray} from "../../../yManagement/yManagement.types";
import {Flow} from "../flow/flow";
import {SyncedFlowEntry} from "../flowEntry/flowEntry.types";
import {Side} from "turbodombuilder";

/**
 * A branch is a sequential list of FlowEntries (edges) in the order they were created.
 * Each branch has a unique "branchId", so you can reference it from named paths.
 * "connectedBranches" is optional and can store the IDs of branches that split or merge.
 */
export type SyncedFlowBranch = {
    entries?: SyncedFlowEntry[] | YArray<SyncedFlowEntry>;
    connectedBranches?: string[] | YArray<string>;
    overwriting?: string;
};

export type FlowBranchProperties = {
    flow: Flow;
    data: SyncedFlowBranch;
}

export type Bounds = Record<Side, number> & {
    width: number;
    height: number;
}

