import {Coordinate} from "turbodombuilder";

/**
 * A single node-to-node connection, with user-drawn geometry in "points".
 * Each entry belongs exactly to one branch.
 */
export type SyncedFlowEntry = {
    startNodeId?: string;
    endNodeId?: string;
    points?: Coordinate[];
};