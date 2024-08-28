import {SyncedCard} from "../../components/card/card.types";
import {SyncedFlow} from "../../components/flow/flow.types";
import {SyncedMedia} from "../camera/manager/captureManager/captureManager.types";
import {SyncedBranchingNode} from "../../components/branchingNode/branchingNode.types";
import {SyncedType} from "../../abstract/syncedComponent/syncedComponent.types";

export type DocumentData = SyncedType & {
    cards?: Record<string, SyncedCard>,
    branchingNodes?: Record<string, SyncedBranchingNode>,
    flows?: Record<string, SyncedFlow>,
    media?: Record<string, SyncedMedia>,

    counters?: {
        cards: number,
        flows: number,
    }
}
