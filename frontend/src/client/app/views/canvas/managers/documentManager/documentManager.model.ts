import {YMap} from "../../../../../../yManagement/yManagement.types";
import {YComponentModel} from "../../../../../../yManagement/yMvc/yModel/types/yComponentModel";
import {SyncedDocument} from "./documentManager.types";
import {SyncedCard} from "../../../../components/card/card.types";
import {SyncedFlow} from "../../../../components/flow/flow.types";
import {BranchingNodeType, SyncedBranchingNode} from "../../../../components/branchingNode/branchingNode.types";
import {DocumentManagerCardsModel} from "./documentManager.cardsModel";
import {BranchingNode} from "../../../../components/branchingNode/branchingNode";
import {Card} from "../../../../components/card/card";

export class DocumentManagerModel extends YComponentModel {
    private cardsModel: DocumentManagerCardsModel;

    public onCardAdded: (data: SyncedCard, id: string, blockKey: string) => Card;
    public onBranchingNodeAdded: (data: SyncedBranchingNode, id: string, blockKey: string) => BranchingNode;

    public constructor(data: SyncedDocument) {
        super(data);
        this.enableCallbacks = false;

        this.cardsModel = new DocumentManagerCardsModel();
        this.cardsModel.onAdded = (data, id, blockKey) => {
            if ((data as YMap).get("type") == BranchingNodeType.node) return this.onBranchingNodeAdded(data, id, blockKey);
            else return this.onCardAdded(data, id, blockKey);
        };
    }

    public initialize(blockKey: string = this.defaultBlockKey) {
        super.initialize(blockKey);
        this.cardsModel.cards = this.cards;
        this.cardsModel.branchingNodes = this.branchingNodes;
    }

    public get cards(): YMap<SyncedCard> {
        return this.getData("cards");
    }

    public get branchingNodes(): YMap<SyncedBranchingNode> {
        return this.getData("branchingNodes");
    }

    public get flows(): YMap<SyncedFlow> {
        return this.getData("flows");
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