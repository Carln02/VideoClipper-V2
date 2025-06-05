import {SyncedCard} from "../../components/card/card.types";
import {SyncedBranchingNode} from "../../components/branchingNode/branchingNode.types";
import {SyncedFlow} from "../../components/flow/flow.types";
import {YDoc, YMap} from "../../../yManagement/yManagement.types";
import {ProjectModel} from "./project.model";
import {ProjectView} from "./project.view";
import {DirectorProperties} from "../director/director.types";
import {SyncedMedia} from "../../handlers/mediaHandler/mediaHandler.types";

export enum ProjectScreens {
    home = "home",
    canvas = "canvas",
    camera = "camera",
}

export type ProjectProperties = DirectorProperties<ProjectScreens,
    ProjectView, SyncedDocument, ProjectModel> & {
    document?: YDoc
};

export type SyncedDocument = YMap & {
    cards?: YMap<SyncedCard>,
    branchingNodes?: YMap<SyncedBranchingNode>,
    flows?: YMap<SyncedFlow>,

    media?: YMap<SyncedMedia>,

    counters?: { cards: number, flows: number }
};