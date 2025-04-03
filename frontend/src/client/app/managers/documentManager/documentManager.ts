import {BranchingNode} from "../../components/branchingNode/branchingNode";
import {Card} from "../../components/card/card";
import {SyncedCard} from "../../components/card/card.types";
import {auto, define, Point} from "turbodombuilder";
import {SyncedText, TextType} from "../../components/textElement/textElement.types";
import {SyncedClip} from "../../components/clip/clip.types";
import {randomColor} from "../../../utils/random";
import {YUtilities} from "../../../../yManagement/yUtilities";
import {DocumentManagerModel} from "./documentManager.model";
import {YArray, YDoc, YMap} from "../../../../yManagement/yManagement.types";
import {SyncedFlowTag} from "../../components/flowTag/flowTag.types";
import {SyncedFlowEntry} from "../../components/flowEntry/flowEntry.types";
import {SyncedFlowBranch} from "../../components/flowBranch/flowBranch.types";
import {SyncedFlow} from "../../components/flow/flow.types";
import {Flow} from "../../components/flow/flow";
import {FlowBranch} from "../../components/flowBranch/flowBranch";
import {DocumentManagerView} from "./documentManager.view";
import {DocumentManagerProperties, DocumentScreens, SyncedDocument} from "./documentManager.types";
import {ContextManager} from "../contextManager/contextManager";
import {ToolPanel} from "../../panels/toolPanel/toolPanel";
import {ShootingPanel} from "../../panels/shootingPanel/shootingPanel";
import {ToolType} from "../toolManager/toolManager.types";
import {TextPanel} from "../../panels/textPanel/textPanel";
import {ScreenManager} from "../screenManager/screenManager";
import {ToolManager} from "../toolManager/toolManager";
import {Canvas} from "../../screens/canvas/canvas";
import {Camera} from "../../screens/camera/camera";
import {AppManager} from "../appManager/appManager";

@define()
export class DocumentManager extends ScreenManager<DocumentScreens, DocumentManagerView, SyncedDocument,
    DocumentManagerModel, AppManager> {
    private readonly _contextManager: ContextManager;
    private readonly _toolManager: ToolManager;

    public constructor(properties: DocumentManagerProperties) {
        super(properties);
        if (properties.document) this.document = properties.document;

        this._contextManager = new ContextManager();
        this._toolManager = new ToolManager();

        this.mvc.generate({
            modelConstructor: DocumentManagerModel,
            viewConstructor: DocumentManagerView,
            data: this.document?.getMap("document_content"),
            initialize: false
        });

        this.model.onBranchingNodeAdded = data => new BranchingNode({
            parent: this.view.cardsParent,
            data: data,
            screenManager: this
        });

        this.model.onCardAdded = data => new Card({
            parent: this.view.cardsParent,
            data: data,
            screenManager: this
        });

        this.model.onFlowAdded = data => new Flow({
            parent: this.view.flowsParent,
            data: data,
            screenManager: this
        });

        this.mvc.initialize();
        this.currentType = DocumentScreens.canvas;

        this.toolPanel.addPanel(new ShootingPanel({toolPanel: this.toolPanel, screenManager: this}), ToolType.shoot);
        this.toolPanel.addPanel(new TextPanel({toolPanel: this.toolPanel, screenManager: this}), ToolType.text);

        this.screenManager.eventManager.authorizeEventScaling = () => this.currentType == DocumentScreens.canvas;
        this.screenManager.eventManager.scaleEventPosition = (position: Point) =>
           this.canvas.navigationManager.computePositionRelativeToCanvas(position);
    }

    public get contextManager(): ContextManager {
        return this._contextManager;
    }

    public get toolManager(): ToolManager {
        return this._toolManager;
    }

    @auto()
    public set document(value: YDoc) {
        if (this.model) this.model.data = value.getMap("document_content");
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

    public get canvas(): Canvas {
        return this.getScreen(DocumentScreens.canvas) as Canvas;
    }

    public get camera(): Camera {
        return this.getScreen(DocumentScreens.camera) as Camera;
    }
}
