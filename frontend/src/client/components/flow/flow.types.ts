import {YArray, YMap} from "../../../yManagement/yManagement.types";
import {SyncedFlowEntry} from "../flowEntry/flowEntry.types";
import {SyncedFlowSelector} from "../flowSelector/flowSelector.types";

/**
 * Represents the entire flow document:
 * - "branches" is an array of linear branches.
 * - "flowTags" can store roots or additional metadata.
 * - "defaultName" is optional labeling, same as before.
 */
export type SyncedFlow = {
    entries?: YMap<YArray<SyncedFlowEntry>> | Record<string, SyncedFlowEntry[]>;
    tags?: YArray<SyncedFlowSelector> | SyncedFlowSelector[];
    defaultName?: string;
    color?: string;
};

/**
 * Optional utility type that lets you reference a specific coordinate inside the flow.
 * "branchIndex" or "branchId" can locate which branch you're in,
 * then "entryIndex" locates which entry in that branch,
 * "pointIndex" locates the exact point in the geometry array.
 */
export type FlowPoint = {
    flowId?: string;
    branchId?: string;
    entryIndex?: number;
    lastNodeId?: string;
    pointIndex?: number;
};

export type FlowIntersection = {
    distance: number,
    branchId?: string,
    previousDefinedPointIndex: number,
    point: DOMPoint
};