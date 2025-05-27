import {SyncedCard} from "../../components/card/card.types";
import {SyncedBranchingNode} from "../../components/branchingNode/branchingNode.types";
import {SyncedFlow} from "../../components/flow/flow.types";
import {YDoc, YMap} from "../../../yManagement/yManagement.types";
import {ScreenManagerProperties} from "../screenManager/screenManager.types";
import {App} from "../app/app";
import {SyncedMedia} from "../../managers/mediaManager/mediaManager.types";
import {ProjectModel} from "./project.model";
import {ProjectView} from "./project.view";

export enum ProjectScreens {
    home = "home",
    canvas = "canvas",
    camera = "camera",
}

export type DocumentProperties = ScreenManagerProperties<ProjectScreens,
    ProjectView, SyncedDocument, ProjectModel, App> & {
    document?: YDoc
};

export type SyncedDocument = YMap & {
    cards?: YMap<SyncedCard>,
    branchingNodes?: YMap<SyncedBranchingNode>,
    flows?: YMap<SyncedFlow>,

    media?: YMap<SyncedMedia>,

    counters?: { cards: number, flows: number }
};