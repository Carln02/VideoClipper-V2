import {SyncedType} from "../../abstract/syncedComponent/syncedComponent.types";
import {Coordinate} from "turbodombuilder";

export type SyncedBranchingNodeData = {
    origin?: Coordinate
};

export type SyncedBranchingNode = SyncedType<SyncedBranchingNodeData>;