import {BranchingNode} from "../../components/branchingNode/branchingNode";
import {Card} from "../../components/card/card";
import {YDoc, YMap} from "../../../../yProxy";
import {SyncedCard} from "../../components/card/card.types";
import {Point} from "turbodombuilder";
import {SyncedText, TextType} from "../../components/textElement/textElement.types";
import {SyncedClip} from "../../components/clip/clip.types";
import {randomColor} from "../../../utils/random";
import {YDocument} from "../../../../yManagement/yDocument";
import {YUtilities} from "../../../../yManagement/yUtilities";
import {DocumentManagerModel} from "./documentManager.model";

export class DocumentManager extends YDocument {
    public readonly documentModel: DocumentManagerModel;
    // public readonly flowsModel

    //Parents used to segregate different types of elements placed on the canvas
    //Mainly to make sure that flows are below cards
    public readonly cardsParent: HTMLElement;
    public readonly flowsParent: HTMLElement;

    public constructor(document: YDoc, cardsParent: HTMLElement, flowsParent: HTMLElement) {
        super(document);
        this.documentModel = new DocumentManagerModel(document.getMap("document_content"));

        this.cardsParent = cardsParent;
        this.flowsParent = flowsParent;

        this.documentModel.onBranchingNodeAdded = data => new BranchingNode({parent: this.cardsParent, data: data});
        this.documentModel.onCardAdded = data => new Card({parent: this.cardsParent, data: data});

        // this.flowsManager.onAdded = data => new Flow(data, this.flowsParent);
        // this.flowsManager = new YMapManager<SyncedFlow, Flow>(this.flows);
    }

    //CARDS

    public async createNewCard(position: Point): Promise<string> {
        this.documentModel.incrementCardsCount();

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
            title: "Card - " + this.documentModel.cardsCount,
            metadata: metadataMap,
            syncedClips: YUtilities.createYArray([defaultClipMap]),
        });

        return await YUtilities.addInYMap(cardMap, this.documentModel.cards);
    }

    public clear() {
        this.documentModel.clear();
        // this.flowsManager.clear();
    }
}
