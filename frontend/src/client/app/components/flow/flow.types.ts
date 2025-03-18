import {Coordinate} from "turbodombuilder";
import {YArray, YMap} from "../../../../yManagement/yManagement.types";

/**
 * Represents the entire flow document:
 * - "branches" is an array of linear branches.
 * - "flowTags" can store roots or additional metadata.
 * - "defaultName" is optional labeling, same as before.
 */
export type SyncedFlow = YMap & {
    branches?: YMap<SyncedFlowBranch>;
    tags?: YArray<SyncedFlowTag>;
    defaultName?: string;
};

/**
 * A branch is a sequential list of FlowEntries (edges) in the order they were created.
 * Each branch has a unique "branchId", so you can reference it from named paths.
 * "connectedBranches" is optional and can store the IDs of branches that split or merge.
 */
export type SyncedFlowBranch = YMap & {
    entries: YArray<SyncedFlowEntry>;
    connectedBranches?: YArray<string>;
    overwriting?: boolean;
};

/**
 * A single node-to-node connection, with user-drawn geometry in "points".
 * Each entry belongs exactly to one branch.
 */
export type SyncedFlowEntry = YMap & {
    startNodeId?: string;
    endNodeId?: string;
    points?: YArray<Coordinate>;
};

/**
 * A flow tag might store a "nodeId" (as a root for traversal)
 * and "namedPaths" referencing branches.
 */
export type SyncedFlowTag = YMap & {
    nodeId?: string;
    paths?: YArray<SyncedFlowPath>;
};

/**
 * A named path is now a sequence of branch references, indicating
 * which branches form a complete user-labeled route.
 * "branchIds" points to the branches in the order they are traversed.
 */
export type SyncedFlowPath = {
    name?: string;
    index?: number;
    branchIds?: YArray<string>;
};

/**
 * Optional utility type that lets you reference a specific coordinate inside the flow.
 * "branchIndex" or "branchId" can locate which branch you're in,
 * then "entryIndex" locates which entry in that branch,
 * "pointIndex" locates the exact point in the geometry array.
 */
export type FlowPoint = {
    flowId?: string;
    branchIndex?: number; // or branchId?: string if you want IDs instead
    entryIndex?: number;
    lastNodeId?: string;
    pointIndex?: number;
};