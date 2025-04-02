import {BranchingNode} from "../../components/branchingNode/branchingNode";
import {Card} from "../../components/card/card";
import {SyncedCard} from "../../components/card/card.types";
import {define, Point} from "turbodombuilder";
import {SyncedText, TextType} from "../../components/textElement/textElement.types";
import {SyncedClip} from "../../components/clip/clip.types";
import {randomColor} from "../../../utils/random";
import {YDocument} from "../../../../yManagement/yDocument";
import {YUtilities} from "../../../../yManagement/yUtilities";
import {DocumentManagerModel} from "./documentManager.model";
import {YArray, YDocumentProperties, YMap} from "../../../../yManagement/yManagement.types";
import {SyncedFlowTag} from "../../components/flowTag/flowTag.types";
import {SyncedFlowEntry} from "../../components/flowEntry/flowEntry.types";
import {SyncedFlowBranch} from "../../components/flowBranch/flowBranch.types";
import {SyncedFlow} from "../../components/flow/flow.types";
import {Flow} from "../../components/flow/flow";
import {FlowBranch} from "../../components/flowBranch/flowBranch";
import {DocumentManagerView} from "./documentManager.view";
import {SyncedDocument} from "./documentManager.types";
import {ContextView} from "../contextManager/contextManager.types";
import {ContextManager} from "../contextManager/contextManager";
import {ToolPanel} from "../../panels/toolPanel/toolPanel";
import {ShootingPanel} from "../../panels/shootingPanel/shootingPanel";
import {ToolType} from "../toolManager/toolManager.types";
import {TextPanel} from "../../panels/textPanel/textPanel";

@define()
export class DocumentManager extends YDocument<DocumentManagerView, SyncedDocument, DocumentManagerModel> {
    public constructor(properties: YDocumentProperties<DocumentManagerView, SyncedDocument, DocumentManagerModel>) {
        super(properties);
        this.mvc.generate({
            modelConstructor: DocumentManagerModel,
            viewConstructor: DocumentManagerView,
            data: this.document.getMap("document_content"),
            initialize: false
        });

        this.model.onBranchingNodeAdded = data => new BranchingNode({parent: this.view.cardsParent, data: data});
        this.model.onCardAdded = data => new Card({parent: this.view.cardsParent, data: data});
        this.model.onFlowAdded = data => new Flow({parent: this.view.flowsParent, data: data});

        this.mvc.initialize();
        this.switchTo(ContextView.canvas);

        this.toolPanel.addPanel(new ShootingPanel({toolPanel: this.toolPanel}), ToolType.shoot);
        this.toolPanel.addPanel(new TextPanel({toolPanel: this.toolPanel}), ToolType.text);
    }

    public get toolPanel(): ToolPanel {
        return this.view.toolPanel;
    }

    public get flows(): Flow[] {
        return this.model.flows;
    }

    public getFlow(id: string): Flow {
        return this.model.flowsModel.getInstance(id);
    }

    public forEachBranch(callback: (branch: FlowBranch, flow: Flow) => void) {
        this.flows.forEach(flow => flow.branches.forEach(branch => callback(branch, flow)));
    }

    //CARDS

    public async createNewCard(position: Point): Promise<string> {
        this.model.incrementCardsCount();

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
            title: "Card - " + this.model.cardsCount,
            metadata: metadataMap,
            syncedClips: YUtilities.createYArray([defaultClipMap]),
        });

        return await YUtilities.addInYMap(cardMap, this.model.cardsData);
    }

    public async createNewFlow(position: Point, nodeId: string): Promise<string> {
        this.model.incrementFlowsCount();

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
            defaultName: "Flow " + this.model.flowsCount
        });

        return await YUtilities.addInYMap(flowMap, this.model.flowsData);
    }

    public clear() {
        this.model.clear();
    }

    public switchTo(context: ContextView) {
        this.view.canvas.show(context == ContextView.canvas);
        this.view.camera.show(context == ContextView.camera);
        ContextManager.instance.view = context;
    }
}
