import {SyncedCard} from "../../components/card/card.types";
import {SyncedFlow} from "../../components/flow/flow.types";
import {SyncedMedia} from "../camera/manager/captureManager/captureManager.types";
import {SyncedBranchingNode} from "../../components/branchingNode/branchingNode.types";
import {YProxied, YNumber, YRecord} from "../../../../yProxy/yProxy";

export type DocumentData = YProxied<{
    cards?: YRecord<string, SyncedCard>,
    branchingNodes?: YRecord<string, SyncedBranchingNode>,
    flows?: YRecord<string, SyncedFlow>,
    media?: YRecord<string, SyncedMedia>,

    counters?: YProxied<{ cards: YNumber, flows: YNumber }>
}>