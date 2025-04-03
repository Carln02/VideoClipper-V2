import {SyncedCard} from "../../components/card/card.types";
import {SyncedBranchingNode} from "../../components/branchingNode/branchingNode.types";
import {SyncedFlow} from "../../components/flow/flow.types";
import {YDoc, YMap} from "../../../../yManagement/yManagement.types";
import {SyncedMedia} from "../captureManager/captureManager.types";
import {DocumentManagerView} from "./documentManager.view";
import {DocumentManagerModel} from "./documentManager.model";
import {ScreenManagerProperties} from "../screenManager/screenManager.types";
import {AppManager} from "../appManager/appManager";

export enum DocumentScreens {
    home = "home",
    canvas = "canvas",
    camera = "camera",
}

export type DocumentManagerProperties = ScreenManagerProperties<DocumentScreens,
    DocumentManagerView, SyncedDocument, DocumentManagerModel, AppManager> & {
    document?: YDoc
};

export type SyncedDocument = YMap & {
    cards?: YMap<SyncedCard>,
    branchingNodes?: YMap<SyncedBranchingNode>,
    flows?: YMap<SyncedFlow>,

    media?: YMap<SyncedMedia>,

    counters?: { cards: number, flows: number }
};