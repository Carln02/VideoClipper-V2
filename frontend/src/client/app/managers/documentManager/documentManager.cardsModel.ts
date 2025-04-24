import {YMap} from "../../../../yManagement/yManagement.types";
import {SyncedBranchingNode} from "../../components/branchingNode/branchingNode.types";
import {BranchingNode} from "../../components/branchingNode/branchingNode";
import {Card} from "../../components/card/card";
import {YManagerModel} from "../../../../yManagement/yModel/types/yManagerModel";

export class DocumentManagerCardsModel extends YManagerModel<SyncedBranchingNode, BranchingNode, string, YMap> {
    public get cards(): YMap {
        return this.getBlockData("cards");
    }

    public set cards(value: YMap) {
        this.setBlock(value, "cards", "cards");
    }

    public get cardsInstances(): Card[] {
        return this.getAllComponents("cards") as Card[];
    }

    public get branchingNodes(): YMap {
        return this.getBlockData("branchingNodes");
    }

    public set branchingNodes(value: YMap) {
        this.setBlock(value, "branchingNodes", "branchingNodes");
    }

    public get branchingNodesInstances(): BranchingNode[] {
        return this.getAllComponents("branchingNodes");
    }
}