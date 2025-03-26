import {
    YMapManagerModel
} from "../../../../yManagement/yModel/types/yManagerModel/types/yMapManagerModel";
import {YMap} from "../../../../yManagement/yManagement.types";
import {SyncedBranchingNode} from "../../components/branchingNode/branchingNode.types";
import {BranchingNode} from "../../components/branchingNode/branchingNode";
import {Card} from "../../components/card/card";

export class DocumentManagerCardsModel extends YMapManagerModel<SyncedBranchingNode, BranchingNode> {
    public get cards(): YMap {
        return this.getDataBlock("cards");
    }

    public set cards(value: YMap) {
        this.setDataBlock(value, "cards", "cards");
    }

    public get cardsInstances(): Card[] {
        return this.getAllComponents("cards") as Card[];
    }

    public get branchingNodes(): YMap {
        return this.getDataBlock("branchingNodes");
    }

    public set branchingNodes(value: YMap) {
        this.setDataBlock(value, "branchingNodes", "branchingNodes");
    }

    public get branchingNodesInstances(): BranchingNode[] {
        return this.getAllComponents("branchingNodes");
    }
}