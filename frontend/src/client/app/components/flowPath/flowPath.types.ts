import { YArray } from "../../../../yManagement/yManagement.types";

/**
 * A named path is now a sequence of branch references, indicating
 * which branches form a complete user-labeled route.
 * "branchIds" points to the branches in the order they are traversed.
 */
export type SyncedFlowPath = {
    name?: string;
    index?: number;
    branchIds?: string[];
};