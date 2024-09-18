import {SyncedType} from "../../abstract/syncedComponent/syncedComponent.types";
import {Coordinate} from "turbodombuilder";
import {YProxied} from "../../../../yWrap-v3/yProxy/yProxy.types";

/**
 * @description Datatype of a synced flow. Contains an array of branches
 */
export type SyncedFlowData = {
    flowBranches?: SyncedType<SyncedFlowBranch[]>,
    flowTags?: SyncedFlowTag[],
    defaultName?: string,
};

/**
 * @description Datatype of a synced flow. Contains an array of branches
 */
export type SyncedFlow = YProxied<{
    flowBranches?: SyncedType<SyncedFlowBranch[]>,
    flowTags?: SyncedFlowTag[],
    defaultName?: string,
}>;

/**
 * @description A synced flow's branch datatype.
 * @property overwriting - Indicates the index (if any) of the branch it is overwriting
 * @property flowEntries - An array of flow entries constituting this branch. Explained below.
 */
export type SyncedFlowBranch = SyncedType<{
    flowEntries?: SyncedFlowEntry[],
    childBranches?: number[],
    overwriting?: number,
}>;

/**
 * @description Data representing a flow entry
 * @property startNodeId - The ID of the node where the entry starts
 * @property endNodeId - The ID of the node where the entry ends (can be the same as startNodeId)
 * @property points - An array of x-y coordinates representing points lying between startNode and endNode
 */
export type SyncedFlowEntry = {
    startNodeId?: string,
    endNodeId?: string,
    points?: Coordinate[]
};

export type SyncedFlowTag = SyncedType<{
    nodeId?: string,
    namedPaths?: NamedFlowPath[],
}>;

export type NamedFlowPath = {
    name?: string,
    index?: number,
    branchIndices?: number[]
}

/**
 * @description Data representing information to locate a point inside a synced flow
 */
export type FlowPoint = {
    flowId?: string,
    branchIndex?: number,
    entryIndex?: number,
    lastNodeId?: string,
    pointIndex?: number,
};
