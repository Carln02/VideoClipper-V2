import {VcComponent} from "../../components/component/component";
import {Project} from "../../directors/project/project";
import {ClickMode, Coordinate, css, define, div, Point, ToolManager} from "turbodombuilder";
import { NavigationManager } from "../../managers/navigationManager/navigationManager";
import { Toolbar } from "../../components/toolbar/toolbar";
import { NavigatableElement } from "../../managers/navigationManager/navigationManager.types";
import {ProjectScreens, Substrate, ToolType} from "../../directors/project/project.types";
import {ShootTool} from "../../tools/shoot/shoot";
import {NavigatorTool} from "../../tools/navigator/navigator";
import {SelectionTool} from "../../tools/selection/selection";
import {FlowEntry} from "../../components/flowEntry/flowEntry";
import {Flow} from "../../components/flow/flow";

@define("vc-grid")
export class Grid extends VcComponent<any, any, any, Project> implements Substrate {
    //Grid parent --> contains the main components that are translated/scaled
    public readonly content: HTMLDivElement;

    public readonly navigationManager: NavigationManager;

    public gridSize = [50,100];

    public gridElements: string[][] = new Array(this.gridSize[0]).fill(false)
                                    .map(() => new Array(this.gridSize[1]).fill(null)
                                    ); //TODO dynamic?
    public gridRoots : string[];

    public gridElementWidth : number = 600;
    public gridElementHeight : number = 600;

    //Main toolbar
    private readonly toolbar: Toolbar;

    public constructor(document: Project) {
        super({director: document});

        this.content = div({parent: this, id: "grid-content"});

        //Init navigation manager
        this.navigationManager = new NavigationManager(this);

        //Init toolbar
        this.toolbar = new Toolbar({
            parent: this,
            classes: "bottom-toolbar",
            director: this.director,
            tools: [
                // {name: ToolType.selection, key: "Shift"},
                new SelectionTool({name: ToolType.selection, toolManager: this.toolManager, director: this.director, key: "Shift"}),
                new NavigatorTool({name: ToolType.navigator, toolManager: this.toolManager, director: this.director}),
                ToolType.createCard,
                ToolType.createText,
                ToolType.delete,
                new ShootTool({name: ToolType.shoot, toolManager: this.toolManager, director: this.director}),
            ]
        });

        this.initTools();

        // this.initGrid();
    }

    public get toolManager(): ToolManager<ToolType> {
        return this.director.toolManager as ToolManager<ToolType>;
    }

    private initTools() {
        //Create all tools
        // this.toolManager.addTool(new ConnectionTool(this.director));

        //Init default tools at hand
        this.toolManager.setTool(this.toolManager.getToolByKey("Shift"), ClickMode.left);
        this.toolManager.setTool(this.toolManager.getToolByKey("Control"), ClickMode.middle, {select: false, activate: false});
    }

    public remove(): this {
        super.remove();
        return this;
    }

    public get scale() {
        if (this.director.currentType !== ProjectScreens.grid) return 1;
        return this.navigationManager.scale;
    }

    public addToGrid(x : number, y : number, element : string){
        this.gridElements[x][y] = element;
    }

    public removeFromGrid(x : number, y : number){
        this.gridElements[x][y] = undefined;
    }

    public getElement(x : number, y : number){
        return this.gridElements[x][y];
    }

    public getGridPosition(element : string){
        for(let i = 0; i < this.gridElements.length; i++){
            for(let j = 0; j < this.gridElements[i].length; j++){
                if(this.gridElements[i][j] === element){
                    return new Point(i, j);
                }
            }
        }
        return new Point(-1, -1);
    }

    public createConnection(x1 : number, y1 : number, x2 : number, y2 : number ){
        let element1 = this.gridElements[x1][y1];
        let element2 = this.gridElements[x2][y2];

        console.log("creating connection from", element1, "to", element2); //TODO
    }

    public createConnectionRecursively(entry : FlowEntry, startNodePos ?: Point){
        if(!startNodePos)  startNodePos = this.getGridPosition(entry.startNodeId);
        if(this.getElement(startNodePos.x, startNodePos.y) !== entry.startNodeId) throw new Error("start node not in grid");

        const endNodePos : Point = this.getNextBranchPos(startNodePos);
        this.gridElements[endNodePos.x][endNodePos.y] = entry.endNodeId;


        console.log(this.director.getNode(entry.startNodeId).title, this.director.getNode(entry.endNodeId).title);

        this.director.getFlow(entry.flow.dataId).getEntries(entry.endNodeId)?.forEach(endEntry => {
            this.createConnectionRecursively(endEntry, endNodePos);
        });
    }

    public getNextBranchPos(value : Point){
        if(!this.gridElements[value.x][value.y]) return value;
        if(!this.gridElements[value.x][value.y +1]) return new Point(value.x, value.y + 1);
        else return this.getNextBranchPos(new Point(value.x + 1, value.y));
    }

    public findRootNodes(flowID : string) : string[] {
        let countEndNodes : Map<string, number> = new Map();
        this.director.getFlow(flowID).getAllEntries().forEach(entry => {
            countEndNodes.set(entry.startNodeId, 0);
        });

        // count the number of entries that end on each of the start nodes
        this.director.getFlow(flowID).getAllEntries().forEach(entry => {
            if(countEndNodes.has(entry.endNodeId))
                countEndNodes.set(entry.endNodeId, countEndNodes.get(entry.endNodeId) + 1);
        });

        //get min value from the countEndNodes
        let minValue = Math.min(...Array.from(countEndNodes.values()));

        if (minValue > 0) console.warn("cycle detected");

        // root nodes are the nodes with the min value
        let rootNodes : string[] = [];
        countEndNodes.forEach((value, key) => {
            if(value === minValue) rootNodes.push(key);
        });

        return rootNodes;
    }

    // TODO handle multiple roots
    public initGrid(flow : Flow){
        this.gridRoots = this.findRootNodes(flow.dataId);
        this.gridElements[0][0] = this.gridRoots[0];
        let rootEntries = flow.getEntries(this.gridRoots[0]);
        rootEntries.forEach(entry => {
            this.createConnectionRecursively(entry);
        });

        for(let i = 0; i < this.gridElements.length; i++){
            for(let j = 0; j < this.gridElements[i].length; j++) {
                if(this.gridElements[i][j]){
                    let value : Point = this.gridToScreen(i,j);

                    let nodeID = this.gridElements[i][j];
                    let node = this.director.getNode(nodeID);
                    node.setStyle("transform", `translate3d(calc(${value.x}px - 50%), calc(${value.y}px - 50%), 0)`);
                    console.log(value, node.title);
                }
                }
            }
    }

    public gridToScreen(x : number, y : number){
        return new Point(x * this.gridElementWidth, y * this.gridElementHeight);
    }

    public screenToGrid(value : Point){
        return new Point(value.x / this.gridElementWidth, value.y / this.gridElementHeight);
    }

    /**
     * @description Translate and scale the canvas by the given values
     * @param translation
     * @param scale
     */
    public transform(translation: Point, scale: number) {
        this.content.setStyle("transform", css`translate3d(${translation.x}px, ${translation.y}px, 0) scale3d(${scale}, ${scale}, 1)`);
    }
}