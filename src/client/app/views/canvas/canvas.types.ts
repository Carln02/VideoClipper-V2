import {SyncedCard, SyncedCardData} from "../../components/card/card.types";
import {SyncedFlow, SyncedFlowData} from "../../components/flow/flow.types";
import {SyncedMedia, SyncedMediaData} from "../camera/manager/captureManager/captureManager.types";
import {SyncedBranchingNode, SyncedBranchingNodeData} from "../../components/branchingNode/branchingNode.types";
import {YProxied, YNumber, YRecord} from "../../../../yProxy";

export type DocumentData = {
    cards?: Record<string, SyncedCardData>,
    branchingNodes?: Record<string, SyncedBranchingNodeData>,
    flows?: Record<string, SyncedFlowData>,
    media?: Record<string, SyncedMediaData>,

    counters?: { cards: number, flows: number }
};

export type SyncedDocumentData = YProxied<{
    cards?: YRecord<string, SyncedCard>,
    branchingNodes?: YRecord<string, SyncedBranchingNode>,
    flows?: YRecord<string, SyncedFlow>,
    media?: YRecord<string, SyncedMedia>,

    counters?: YProxied<{ cards: YNumber, flows: YNumber }>
}>;