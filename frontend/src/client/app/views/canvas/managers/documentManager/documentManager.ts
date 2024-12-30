import {SyncedDocument} from "./documentManager.types";
import {YMapManager} from "../../../../yjsManagement/yMapManager";
import {BranchingNodeType, SyncedBranchingNode} from "../../../../components/branchingNode/branchingNode.types";
import {BranchingNode} from "../../../../components/branchingNode/branchingNode";
import {Card} from "../../../../components/card/card";
import {YDoc, YMap} from "../../../../../../yProxy";
import {SyncedCard} from "../../../../components/card/card.types";
import {SyncedFlow} from "../../../../components/flow/flow.types";
import {YDocument} from "../../../../yjsManagement/yDocument";
import {Point} from "turbodombuilder";
import {SyncedText, TextType} from "../../../../components/textElement/textElement.types";
import {SyncedClip} from "../../../../components/clip/clip.types";
import {randomColor} from "../../../../../utils/random";
import {YUtilities} from "../../../../yjsManagement/yUtilities";

export class DocumentManager extends YDocument {
    private readonly data: SyncedDocument;

    public readonly cardsManager: YMapManager<SyncedBranchingNode, BranchingNode>;
    // private flowsManager: YMapManager<SyncedFlow, Flow>;

    //Parents used to segregate different types of elements placed on the canvas
    //Mainly to make sure that flows are below cards
    public readonly cardsParent: HTMLElement;
    public readonly flowsParent: HTMLElement;

    public constructor(document: YDoc, cardsParent: HTMLElement, flowsParent: HTMLElement) {
        super(document);
        this.data = document.getMap("document_content");

        this.cardsParent = cardsParent;
        this.flowsParent = flowsParent;

        this.cardsManager = new YMapManager<SyncedBranchingNode, BranchingNode>();
        this.cardsManager.onAdded = data => {
            if ((data as YMap).get("type") == BranchingNodeType.node) return new BranchingNode(data, this.cardsParent);
            else return new Card(data, this.cardsParent);
        };

        // this.flowsManager.onAdded = data => new Flow(data, this.flowsParent);

        this.cardsManager.setDataBlock(this.cards, "cards");
        this.cardsManager.setDataBlock(this.branchingNodes, "branchingNodes");

        // this.flowsManager = new YMapManager<SyncedFlow, Flow>(this.flows);
    }

    //CARDS

    public get cards(): YMap<SyncedCard> {
        return this.data.get("cards");
    }

    public get cardsCount(): number {
        return this.data.get("counters").get("cards");
    }

    private incrementCardsCount() {
        this.data.get("counters").set("cards", this.cardsCount + 1);
    }

    public async createNewCard(position: Point): Promise<string> {
        this.incrementCardsCount();

        const metadataMap = new YMap();

        const textTitleMap = YUtilities.createYMap<SyncedText>({
            type: TextType.title,
            fontSize: 0.1,
            origin: {x: 0.5, y: 0.5}
        });

        const defaultClipMap = YUtilities.createYMap<SyncedClip>({
            startTime: 0,
            endTime: 5,
            backgroundFill: "#FFFFFF",
            color: randomColor(),
            content: YUtilities.createYArray([textTitleMap]),
            mediaId: undefined
        });

        const cardMap = YUtilities.createYMap<SyncedCard>({
            origin: position.object,
            title: "Card - " + this.cardsCount,
            metadata: metadataMap,
            syncedClips: YUtilities.createYArray([defaultClipMap]),
        });

        return await YUtilities.addInYMap(cardMap, this.cards);
    }

    public get flowsCount(): number {
        return this.data.get("counters").get("flows");
    }

    public incrementFlowsCount() {
        this.data.get("counters").set("flows", this.flowsCount + 1);
    }

    public get flows(): YMap<SyncedFlow> {
        return this.data.get("flows");
    }

    public get branchingNodes(): YMap<SyncedBranchingNode> {
        return this.data.get("branchingNodes");
    }

    public clear() {
        this.cardsManager.clear();
        // this.flowsManager.clear();
    }
}
