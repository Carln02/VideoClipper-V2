import {SyncedCard} from "../../components/card/card.types";
import {SyncedFlow} from "../../components/flow/flow.types";
import {BranchingNodeType, SyncedBranchingNode} from "../../components/branchingNode/branchingNode.types";
import {BranchingNode} from "../../components/branchingNode/branchingNode";
import {Card} from "../../components/card/card";
import {Flow} from "../../components/flow/flow";
import {SyncedMedia} from "../../managers/mediaManager/mediaManager.types";
import { YComponentModel } from "../../../yManagement/yModel/types/yComponentModel";
import {ProjectCardsModel} from "./project.cardsModel";
import {ProjectFlowsModel} from "./project.flowsModel";
import {SyncedDocument} from "./project.types";
import { YMap } from "../../../yManagement/yManagement.types";
import {YUtilities} from "../../../yManagement/yUtilities";

export class ProjectModel extends YComponentModel {
    public readonly cardsModel: ProjectCardsModel;
    public readonly flowsModel: ProjectFlowsModel;

    public onCardAdded: (data: SyncedCard, id: string, blockKey: string) => Card;
    public onBranchingNodeAdded: (data: SyncedBranchingNode, id: string, blockKey: string) => BranchingNode;
    public onFlowAdded: (data: SyncedFlow, id: string, blockKey: string) => Flow;

    public constructor(data: SyncedDocument) {
        super(data);
        this.enabledCallbacks = false;

        this.cardsModel = new ProjectCardsModel();
        this.cardsModel.onAdded = (data, id, blockKey) => {
            console.log(data);
            console.log("CARD ADDED")
            if ((data as YMap).get("type") == BranchingNodeType.node) return this.onBranchingNodeAdded(data, id, blockKey);
            else return this.onCardAdded(data, id, blockKey);
        };

        this.flowsModel = new ProjectFlowsModel();
        this.flowsModel.onAdded = (data, id, blockKey) => this.onFlowAdded(data, id, blockKey);
    }

    public initialize(blockKey: string = this.defaultBlockKey) {
        console.log(":) INITIALIZING DATA BLOCK IN PROJECTTT")
        if (!this.getData("cards")) this.setData("cards", new YMap());
        if (!this.getData("branchingNodes")) this.setData("branchingNodes", new YMap());
        if (!this.getData("flows")) this.setData("flows", new YMap());
        if (!this.getData("media")) this.setData("media", new YMap());
        if (!this.getData("counters")) this.setData("counters", YUtilities.createYMap({cards: 0, flows: 0}));

        super.initialize(blockKey);

        this.cardsModel.cards = this.getData("cards");
        this.cardsModel.branchingNodes = this.getData("branchingNodes");
        this.flowsModel.data = this.getData("flows");
    }

    public get cards(): Card[] {
        return this.cardsModel.cardsInstances;
    }

    public get branchingNodes(): BranchingNode[] {
        return this.cardsModel.branchingNodesInstances;
    }

    public get flows(): Flow[] {
        return this.flowsModel.getAllComponents();
    }

    public get cardsData(): YMap<SyncedCard> {
        return this.cardsModel.cards;
    }

    public get branchingNodesData(): YMap<SyncedBranchingNode> {
        return this.cardsModel.branchingNodes;
    }

    public get flowsData(): YMap<SyncedFlow> {
        return this.flowsModel.data;
    }

    public get media(): YMap<SyncedMedia> {
        return this.getData("media");
    }

    public get cardsCount(): number {
        return this.getData("counters").get("cards");
    }

    public incrementCardsCount() {
        this.getData("counters").set("cards", this.cardsCount + 1);
    }

    public get flowsCount(): number {
        return this.getData("counters").get("flows");
    }

    public incrementFlowsCount() {
        this.getData("counters").set("flows", this.flowsCount + 1);
    }

    public clear(blockKey: string = this.defaultBlockKey) {
        this.cardsModel?.clear(blockKey);
    }
}