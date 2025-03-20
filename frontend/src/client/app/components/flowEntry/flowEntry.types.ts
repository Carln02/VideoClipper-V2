import {YArray, YMap} from "../../../../yManagement/yManagement.types";
import {Coordinate} from "turbodombuilder";

/**
 * A single node-to-node connection, with user-drawn geometry in "points".
 * Each entry belongs exactly to one branch.
 */
export type SyncedFlowEntry = YMap & {
    startNodeId?: string;
    endNodeId?: string;
    points?: YArray<Coordinate>;
};

export type SyncedFlowEntryData = {
    startNodeId?: string;
    endNodeId?: string;
    points?: Coordinate[];
};