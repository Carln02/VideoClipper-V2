import {
    YMapManagerModel
} from "../../../../../../yManagement/yMvc/yModel/types/yManagerModel/types/yMapManagerModel";
import {YMap} from "../../../../../../yManagement/yManagement.types";
import {SyncedBranchingNode} from "../../../../components/branchingNode/branchingNode.types";
import {BranchingNode} from "../../../../components/branchingNode/branchingNode";

export class DocumentManagerCardsModel extends YMapManagerModel<SyncedBranchingNode, BranchingNode> {
    public get cards(): YMap {
        return this.getDataBlock("cards");
    }

    public set cards(value: YMap) {
        this.setDataBlock(value, "cards");
    }

    public get branchingNodes(): YMap {
        return this.getDataBlock("branchingNodes");
    }

    public set branchingNodes(value: YMap) {
        this.setDataBlock(value, "branchingNodes");
    }
}