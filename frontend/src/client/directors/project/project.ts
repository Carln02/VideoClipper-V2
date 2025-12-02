import {BranchingNode} from "../../components/branchingNode/branchingNode";
import {Card} from "../../components/card/card";
import {
    addInYMap,
    auto,
    Coordinate,
    createYMap,
    define, expose,
    Point,
    turbo,
    YDoc,
    YMap
} from "turbodombuilder";
import {Flow} from "../../components/flow/flow";
import {ToolPanel} from "../../panels/toolPanel/toolPanel";
import {shootingPanel} from "../../panels/shootingPanel/shootingPanel";
import {textPanel} from "../../panels/textPanel/textPanel";
import {VcComponent} from "../../components/component/component";
import {SyncedBranchingNode} from "../../components/branchingNode/branchingNode.types";
import {ProjectProperties, ProjectScreens, SyncedDocument, ToolType} from "./project.types";
import { ContextManager } from "../../managers/contextManager/contextManager";
import {ProjectView} from "./project.view";
import {ProjectModel} from "./project.model";
import "./project.css";
import {rootDirector, RootDirector} from "../rootDirector/rootDirector";
import {Canvas} from "../../screens/canvas/canvas";
import {Camera} from "../../screens/camera/camera";
import {MediaHandler} from "../../handlers/mediaHandler/mediaHandler";
import {SyncedMedia} from "../../handlers/mediaHandler/mediaHandler.types";

@define("vc-project")
export class Project extends RootDirector<ProjectScreens, ProjectView, SyncedDocument, ProjectModel> {
    private _mediaHandler: MediaHandler;
    private _contextManager: ContextManager;

    public initialize() {
        this._mediaHandler = new MediaHandler(this);
        this._contextManager = new ContextManager();
        super.initialize();
        this.currentType = ProjectScreens.canvas;

        const shootingPanelEl = shootingPanel({
            toolPanel: this.toolPanel,
            director: this
        });
        this.toolPanel.addPanel(shootingPanelEl, ToolType.shoot, ProjectScreens.camera);
        this.toolPanel.addPanel(shootingPanelEl, ToolType.selection, ProjectScreens.camera);
        this.toolPanel.addPanel(textPanel({
            toolPanel: this.toolPanel,
            director: this
        }), ToolType.createText, ProjectScreens.camera);

        this.eventManager.authorizeEventScaling = () => this.currentType == ProjectScreens.canvas;
        this.eventManager.scaleEventPosition = (position: Point) =>
            this.canvas.navigationManager.computePositionRelativeToCanvas(position);

        this.onScreenChange.add(() => this.view.showAppBar(this.currentType !== ProjectScreens.camera));
    }

    public get mediaHandler(): MediaHandler {
        return this._mediaHandler;
    }

    public get contextManager(): ContextManager {
        return this._contextManager;
    }

    @auto() public set document(value: YDoc) {
        if (this.model) this.model.data = value.getMap("document_content");
    }

    @expose("view", false) public accessor toolPanel: ToolPanel;

    public get cards(): Card[] {
        return this.view.cardsObserver.getAllInstances();
    }

    public get branchingNodes(): BranchingNode[] {
        return this.view.branchingNodesObserver.getAllInstances();
    }

    public get flows(): Flow[] {
        return this.view.flowsObserver.getAllInstances();
    }

    public getFlow(id: string): Flow {
        return this.view.flowsObserver.getInstance(id);
    }

    public getNode(id: string): BranchingNode {
        return this.view.cardsObserver.getInstance(id);
    }

    public getMedia(id: string): SyncedMedia & YMap {
        return this.model.media.get(id) as YMap;
    }

    public setMedia(id: string, media: SyncedMedia) {
        this.model.media.set(id, createYMap(media) as SyncedMedia);
    }

    public async createNewNode(position: Coordinate, id?: string): Promise<string> {
        if (position instanceof Point) position = position.object;
        if (!id) return await addInYMap(BranchingNode.createData({origin: position}), this.model.branchingNodesData);
        this.model.branchingNodesData.set(id, BranchingNode.createData({origin: position}));
        return id;
    }

    public async createNewCard(position: Point): Promise<string> {
        this.model.incrementCardsCount();
        const data = Card.createData({
            origin: position.object,
            title: "Card - " + this.model.cardsCount
        });
        return await addInYMap(data, this.model.cardsData);
    }

    public async createNewFlow(position: Point, nodeId: string, color: string): Promise<string> {
        this.model.incrementFlowsCount();
        const defaultName = "Flow " + this.model.flowsCount;
        return await addInYMap(Flow.createData({
            entries: {},
            selectors: {
                0: {nodeId: nodeId}
            },
            defaultName: defaultName,
            color: color
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

export function project(properties: ProjectProperties = {}): Project {
    turbo(properties).applyDefaults({
        tag: "vc-project",
        model: ProjectModel,
        view: ProjectView,
        data: properties.document?.getMap("document_content")
    });
    return rootDirector({...properties}) as Project;
}