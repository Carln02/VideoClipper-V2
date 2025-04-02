import {SyncedCard} from "../../components/card/card.types";
import {SyncedBranchingNode} from "../../components/branchingNode/branchingNode.types";
import {SyncedFlow} from "../../components/flow/flow.types";
import {YMap} from "../../../../yManagement/yManagement.types";
import {SyncedMedia} from "../captureManager/captureManager.types";

export type SyncedDocument = YMap & {
    cards?: YMap<SyncedCard>,
    branchingNodes?: YMap<SyncedBranchingNode>,
    flows?: YMap<SyncedFlow>,

    media?: YMap<SyncedMedia>,

    counters?: { cards: number, flows: number }
};