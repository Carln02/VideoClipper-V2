import {YCoordinate, YProxied} from "../../../../yProxy";
import {Coordinate} from "turbodombuilder";

export type SyncedBranchingNodeData = {
    origin?: Coordinate
};

export type SyncedBranchingNode = YProxied<{
    origin?: YCoordinate
}>;