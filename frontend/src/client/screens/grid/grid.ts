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

@define("vc-grid")
export class Grid extends VcComponent<any, any, any, Project> implements Substrate {
    //Grid parent --> contains the main components that are translated/scaled
    public readonly content: HTMLDivElement;

    public readonly navigationManager: NavigationManager;

    public gridElements: Array<Array<VcComponent>>;
    public gridRoot : VcComponent;

    public gridElementWidth : number;
    public gridElementHeight : number;

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

    public addToGrid(x : number, y : number, element : VcComponent){
        this.gridElements[x][y] = element;
    }

    public removeFromGrid(x : number, y : number){
        this.gridElements[x][y] = undefined;
    }

    public getElement(x : number, y : number){
        return this.gridElements[x][y];
    }

    public createConnection(x1 : number, y1 : number, x2 : number, y2 : number ){
        let element1 = this.gridElements[x1][y1];
        let element2 = this.gridElements[x2][y2];

        console.log("creating connection from", element1, "to", element2); //TODO
    }

    public updatePos(value : Coordinate, element : VcComponent){
        let newValue = value;

        console.log("updating pos of", element, "to", newValue); //TODO

        return newValue;
    }

    public updateGridView(){
        //place the grid root at 0,0 then for each connection
    }
    // public getNextPos(value: Point){
    //     let x = value.x;
    //     let y = value.y;
    //     if(this.gridElements[x][y] === undefined){
    //         return (value)
    //     }
    //     if (this.gridElements[x][y] !== undefined){
    //         value = this.getNextPos(new Point(x+1, y));
    //         value = this.getNextPos(new Point(x, y+1));
    //     }
    // }

    public gridToScreen(x : number, y : number){
        return new Point(x * this.gridElementWidth, y * this.gridElementHeight);
    }

    public screenToGrid(value : Coordinate){
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