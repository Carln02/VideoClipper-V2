import {BranchingNode} from "../../components/branchingNode/branchingNode";
import {Card} from "../../components/card/card";
import {auto, Coordinate, define, Point} from "turbodombuilder";
import {Flow} from "../../components/flow/flow";
import {FlowBranch} from "../../components/flowBranch/flowBranch";
import {ToolPanel} from "../../panels/toolPanel/toolPanel";
import {ShootingPanel} from "../../panels/shootingPanel/shootingPanel";
import {TextPanel} from "../../panels/textPanel/textPanel";
import {VcComponent} from "../../components/component/component";
import {SyncedBranchingNode} from "../../components/branchingNode/branchingNode.types";
import { ContextManager } from "../../managers/contextManager/contextManager";
import { ToolManager } from "../../managers/toolManager/toolManager";
import {ToolType} from "../../managers/toolManager/toolManager.types";
import {ProjectProperties, ProjectScreens, SyncedDocument} from "./project.types";
import {ProjectView} from "./project.view";
import {ProjectModel} from "./project.model";
import {YUtilities} from "../../../yManagement/yUtilities";
import { YDoc } from "../../../yManagement/yManagement.types";
import "./project.css";
import {RootDirector} from "../rootDirector/rootDirector";
import {Canvas} from "../../screens/canvas/canvas";
import {Camera} from "../../screens/camera/camera";
import {MediaHandler} from "../../handlers/mediaHandler/mediaHandler";
import {SyncedMedia} from "../../handlers/mediaHandler/mediaHandler.types";

@define("vc-project")
export class Project extends RootDirector<ProjectScreens, ProjectView, SyncedDocument, ProjectModel> {
    private readonly _mediaHandler: MediaHandler;
    private readonly _contextManager: ContextManager;
    private readonly _toolManager: ToolManager;

    public constructor(properties: ProjectProperties) {
        super(properties);
        if (properties.document) this.document = properties.document;

        this._mediaHandler = new MediaHandler(this);
        this._contextManager = new ContextManager();
        this._toolManager = new ToolManager();

        this.mvc.generate({
            modelConstructor: ProjectModel,
            viewConstructor: ProjectView,
            data: properties.document?.getMap("document_content"),
            initialize: false
        });

        this.model.onBranchingNodeAdded = data => new BranchingNode({
            parent: this.view.cardsParent,
            data: data,
            director: this
        });

        this.model.onCardAdded = data => new Card({
            parent: this.view.cardsParent,
            data: data,
            director: this
        });

        this.model.onFlowAdded = data => new Flow({
            parent: this.view.flowsParent,
            data: data,
            director: this
        });

        this.mvc.initialize();

        this.currentType = ProjectScreens.canvas;

        this.toolPanel.addPanel(new ShootingPanel({
            toolPanel: this.toolPanel,
            director: this
        }), ToolType.shoot, ProjectScreens.camera);
        this.toolPanel.addPanel(new TextPanel({
            toolPanel: this.toolPanel,
            director: this
        }), ToolType.text, ProjectScreens.camera);

        this.eventManager.authorizeEventScaling = () => this.currentType == ProjectScreens.canvas;
        this.eventManager.scaleEventPosition = (position: Point) =>
            this.canvas.navigationManager.computePositionRelativeToCanvas(position);
    }

    public get mediaHandler(): MediaHandler {
        return this._mediaHandler;
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

    public getNode(id: string): BranchingNode {
        return this.model.cardsModel.getInstance(id);
    }

    public getNodeData(id: string): SyncedBranchingNode {
        return this.model.cardsModel.getInstance(id).data;
    }

    public getNodesData(...ids: string[]): SyncedBranchingNode[] {
        return ids.map(id => this.getNodeData(id));
    }

    public getMedia(id: string): SyncedMedia {
        return this.model.media.get(id);
    }

    public setMedia(id: string, media: SyncedMedia) {
        this.model.media.set(id, media);
    }

    public forEachBranch(callback: (branch: FlowBranch, flow: Flow) => void) {
        this.flows.forEach(flow => flow.branches.forEach(branch => callback(branch, flow)));
    }

    //CARDS

    public async createNewNode(position: Coordinate, id?: string): Promise<string> {
        if (position instanceof Point) position = position.object;
        if (!id) return await YUtilities.addInYMap(BranchingNode.createData({origin: position}), this.model.branchingNodesData);
        this.model.branchingNodesData.set(id, BranchingNode.createData({origin: position}));
        return id;
    }

    public async createNewCard(position: Point): Promise<string> {
        this.model.incrementCardsCount();
        return await YUtilities.addInYMap(Card.createData({
            origin: position.object,
            title: "Card - " + this.model.cardsCount
        }), this.model.cardsData);
    }

    public async createNewFlow(position: Point, nodeId: string): Promise<string> {
        this.model.incrementFlowsCount();
        const defaultName = "Flow " + this.model.flowsCount;
        return await YUtilities.addInYMap(Flow.createData({
            branches: {
                "0": {
                    entries: [{
                        startNodeId: nodeId,
                        endNodeId: nodeId,
                        points: [position]
                    }],
                }
            },
            tags: [{
                nodeId: nodeId,
                paths: [{
                    name: defaultName + " - 1",
                    branchIds: ["0"]
                }]
            }],
            defaultName: defaultName
        }), this.model.flowsData);
    }

    public clear() {
        this.model.clear();
    }

    public get canvas(): Canvas {
        return this.getScreen(ProjectScreens.canvas) as Canvas;
    }

    public get camera(): Camera {
        return this.getScreen(ProjectScreens.camera) as Camera;
    }

    public delete(element: VcComponent) {
        if (element instanceof Card) this.model.cardsData.delete(element.dataId);
        else if (element instanceof BranchingNode) this.model.branchingNodesData.delete(element.dataId);
        else if (element instanceof Flow) this.model.flowsData.delete(element.dataId);
    }
}