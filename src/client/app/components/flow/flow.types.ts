import {Coordinate} from "turbodombuilder";
import {YCoordinate, YNumber, YProxied, YProxiedArray, YString} from "../../../../yProxy";

/**
 * @description Datatype of a synced flow. Contains an array of branches
 */
export type SyncedFlowData = {
    flowBranches?: SyncedFlowBranchData[],
    flowTags?: SyncedFlowTagData[],
    defaultName?: string,
};

/**
 * @description Datatype of a synced flow. Contains an array of branches
 */
export type SyncedFlow = YProxied<{
    flowBranches?: YProxiedArray<SyncedFlowBranch, SyncedFlowBranchData>,
    flowTags?: YProxiedArray<SyncedFlowTag, SyncedFlowTagData>,
    defaultName?: YString,
}>;

/**
 * @description A synced flow's branch datatype.
 * @property overwriting - Indicates the index (if any) of the branch it is overwriting
 * @property flowEntries - An array of flow entries constituting this branch. Explained below.
 */
export type SyncedFlowBranchData = {
    flowEntries?: SyncedFlowEntryData[],
    childBranches?: number[],
    overwriting?: number,
};

/**
 * @description A synced flow's branch datatype.
 * @property overwriting - Indicates the index (if any) of the branch it is overwriting
 * @property flowEntries - An array of flow entries constituting this branch. Explained below.
 */
export type SyncedFlowBranch = YProxied<{
    flowEntries?: YProxiedArray<SyncedFlowEntry, SyncedFlowEntryData>,
    childBranches?: YProxiedArray<YNumber, number>,
    overwriting?: YProxiedArray<YNumber, number>,
}>;

/**
 * @description Data representing a flow entry
 * @property startNodeId - The ID of the node where the entry starts
 * @property endNodeId - The ID of the node where the entry ends (can be the same as startNodeId)
 * @property points - An array of x-y coordinates representing points lying between startNode and endNode
 */
export type SyncedFlowEntryData = {
    startNodeId?: string,
    endNodeId?: string,
    points?: Coordinate[]
};

/**
 * @description Data representing a flow entry
 * @property startNodeId - The ID of the node where the entry starts
 * @property endNodeId - The ID of the node where the entry ends (can be the same as startNodeId)
 * @property points - An array of x-y coordinates representing points lying between startNode and endNode
 */
export type SyncedFlowEntry = YProxied<{
    startNodeId?: YString,
    endNodeId?: YString,
    points?: YProxiedArray<YCoordinate, Coordinate>
}>;

export type SyncedFlowTagData = {
    nodeId?: string,
    namedPaths?: NamedFlowPathData[],
};

export type SyncedFlowTag = YProxied<{
    nodeId?: YString,
    namedPaths?: YProxiedArray<NamedFlowPath, NamedFlowPathData>,
}>;

export type NamedFlowPathData = {
    name?: string,
    index?: number,
    branchIndices?: number[]
};

export type NamedFlowPath = YProxied<{
    name?: YString,
    index?: YNumber,
    branchIndices?: YProxiedArray<YNumber, number>
}>;

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
