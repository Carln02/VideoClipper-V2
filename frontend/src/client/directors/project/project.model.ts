import {SyncedCard} from "../../components/card/card.types";
import {SyncedFlow} from "../../components/flow/flow.types";
import {SyncedBranchingNode} from "../../components/branchingNode/branchingNode.types";
import {SyncedMedia} from "../../handlers/mediaHandler/mediaHandler.types";
import {
    blockSignal,
    createYMap, MvcBlockKeyType,
    TurboModel,
    TurboYBlock,
    YMap
} from "turbodombuilder";

export class ProjectModel extends TurboModel {
    public static dataBlockConstructor = TurboYBlock;

    @blockSignal() public cardsBlock: TurboYBlock<YMap>;
    @blockSignal() public branchingNodesBlock: TurboYBlock<YMap>;
    @blockSignal() public flowsBlock: TurboYBlock<YMap>;

    public initialize(blockKey: MvcBlockKeyType<any> = this.defaultBlockKey) {
        if (blockKey === this.defaultBlockKey) {
            if (this.data) this.initializeData();
            this.cardsBlock = this.getData("cards");
            this.branchingNodesBlock = this.getData("branchingNodes");
            this.flowsBlock = this.getData("flows");
        }
        super.initialize(blockKey);
    }

    private initializeData() {
        if (!this.getData("cards")) this.setData("cards", new YMap());
        if (!this.getData("branchingNodes")) this.setData("branchingNodes", new YMap());
        if (!this.getData("flows")) this.setData("flows", new YMap());
        if (!this.getData("media")) this.setData("media", new YMap());
        if (!this.getData("counters")) this.setData("counters", createYMap({cards: 0, flows: 0}));
    }

    public get cardsData(): YMap<SyncedCard> {
        return this.cardsBlock?.data;
    }

    public get branchingNodesData(): YMap<SyncedBranchingNode> {
        return this.branchingNodesBlock?.data;
    }

    public get flowsData(): YMap<SyncedFlow> {
        return this.flowsBlock?.data;
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

    public clear() {
        this.cardsBlock.clear(false);
        this.branchingNodesBlock.clear(false);
        this.flowsBlock.clear(false);
    }
}