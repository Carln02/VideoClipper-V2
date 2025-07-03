import {Coordinate} from "turbodombuilder";
import {Flow} from "../flow/flow";
import { YMap } from "../../../yManagement/yManagement.types";

/**
 * A single node-to-node connection, with user-drawn geometry in "points".
 * Each entry belongs exactly to one branch.
 */
export type SyncedFlowEntry = {
    startNodeId?: string;
    endNodeId?: string;
    points?: Coordinate[];
};

export type SplitEntryData = {
    beforeSplit: SyncedFlowEntry,
    splitEntry: SyncedFlowEntry,
    afterSplit: SyncedFlowEntry
};

export type FlowEntryProperties = {
    flow: Flow;
    data: SyncedFlowEntry & YMap;
}