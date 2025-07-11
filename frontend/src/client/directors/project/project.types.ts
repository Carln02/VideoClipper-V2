import {SyncedCard} from "../../components/card/card.types";
import {SyncedBranchingNode} from "../../components/branchingNode/branchingNode.types";
import {SyncedFlow} from "../../components/flow/flow.types";
import {YDoc, YMap} from "../../../yManagement/yManagement.types";
import {ProjectModel} from "./project.model";
import {ProjectView} from "./project.view";
import {DirectorProperties} from "../director/director.types";
import {SyncedMedia} from "../../handlers/mediaHandler/mediaHandler.types";
import {NavigationManager} from "../../managers/navigationManager/navigationManager";
import {Coordinate, ElementTagMap, Point} from "turbodombuilder";
import {FlowEntry} from "../../components/flowEntry/flowEntry";

export enum ProjectScreens {
    home = "home",
    canvas = "canvas",
    grid = "grid",
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

export enum ToolType {
    connection = "Connect",
    createCard = "Create Card",
    delete = "Delete",
    navigator = "Navigator",
    selection = "Selection",
    shoot = "Shoot",
    createText = "Create Text",
}

export interface Substrate extends HTMLElement {
    readonly navigationManager?: NavigationManager;
    readonly content?: HTMLDivElement;
    scale?: number;
    transform?(translation: Point, scale: number): void;
    updatePos?(value: Coordinate, element: Element): Coordinate;
    constrainFlowEntryPoints?(entry: FlowEntry, points: Point[]): Point[];
}