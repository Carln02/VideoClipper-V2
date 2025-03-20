import {YArray, YMap} from "../../../../yManagement/yManagement.types";

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