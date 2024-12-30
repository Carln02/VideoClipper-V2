import {Coordinate} from "turbodombuilder";

export enum BranchingNodeType {
    card = "card",
    node = "node"
}

export type SyncedBranchingNode = {
    origin?: Coordinate,
    type?: BranchingNodeType
};