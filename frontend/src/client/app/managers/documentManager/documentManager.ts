import {BranchingNode} from "../../components/branchingNode/branchingNode";
import {Card} from "../../components/card/card";
import {SyncedCard} from "../../components/card/card.types";
import {Point} from "turbodombuilder";
import {SyncedText, TextType} from "../../components/textElement/textElement.types";
import {SyncedClip} from "../../components/clip/clip.types";
import {randomColor} from "../../../utils/random";
import {YDocument} from "../../../../yManagement/yDocument";
import {YUtilities} from "../../../../yManagement/yUtilities";
import {DocumentManagerModel} from "./documentManager.model";
import {YArray, YDoc, YMap} from "../../../../yManagement/yManagement.types";
import {SyncedFlowTag} from "../../components/flowTag/flowTag.types";
import {SyncedFlowEntry} from "../../components/flowEntry/flowEntry.types";
import {SyncedFlowBranch} from "../../components/flowBranch/flowBranch.types";
import {SyncedFlow} from "../../components/flow/flow.types";
import {Flow} from "../../components/flow/flow";
import {FlowBranch} from "../../components/flowBranch/flowBranch";

export class DocumentManager extends YDocument {
    public readonly documentModel: DocumentManagerModel;
    // public readonly flowsModel

    //Parents used to segregate different types of elements placed on the canvas
    //Mainly to make sure that flows are below cards
    public readonly cardsParent: HTMLElement;
    public readonly flowsParent: HTMLElement;

    public constructor(document: YDoc, cardsParent: HTMLElement, flowsParent: HTMLElement) {
        super(document);
        this.cardsParent = cardsParent;
        this.flowsParent = flowsParent;

        this.documentModel = new DocumentManagerModel(document.getMap("document_content"));

        this.documentModel.onBranchingNodeAdded = data => new BranchingNode({parent: this.cardsParent, data: data});
        this.documentModel.onCardAdded = data => new Card({parent: this.cardsParent, data: data});
        this.documentModel.onFlowAdded = data => {
            console.log(data)
            return new Flow({parent: this.flowsParent, data: data});
        }

        this.documentModel.initialize();
    }

    public get flows(): Flow[] {
        return this.documentModel.flows;
    }

    public getFlow(id: string): Flow {
        return this.documentModel.flowsModel.getInstance(id);
    }

    public forEachBranch(callback: (branch: FlowBranch, flow: Flow) => void) {
        this.flows.forEach(flow => flow.branches.forEach(branch => callback(branch, flow)));
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

        return await YUtilities.addInYMap(cardMap, this.documentModel.cardsData);
    }

    public async createNewFlow(position: Point, nodeId: string): Promise<string> {
        this.documentModel.incrementFlowsCount();

        const firstEntry = YUtilities.createYMap<SyncedFlowEntry>({
            startNodeId: nodeId,
            endNodeId: nodeId,
            points: [position]
        });

        const branchMap = YUtilities.createYMap<SyncedFlowBranch>({
            entries: YUtilities.createYArray<SyncedFlowEntry>([firstEntry as SyncedFlowEntry]),
            connectedBranches: new YArray<string>(),
            overwriting: "",
        });

        const tagsArray = new YArray<SyncedFlowTag>();

        const flowMap = YUtilities.createYMap<SyncedFlow>({
            branches: YUtilities.createYMap({"0": branchMap}) as YMap<SyncedFlowBranch>,
            tags: tagsArray,
            defaultName: "Flow " + this.documentModel.flowsCount
        });

        return await YUtilities.addInYMap(flowMap, this.documentModel.flowsData);
    }

    public clear() {
        this.documentModel.clear();
    }
}
