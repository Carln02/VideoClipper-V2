import {div} from "turbodombuilder";
import {Project} from "./project";
import {ProjectModel} from "./project.model";
import {ProjectScreens, ToolType} from "./project.types";
import {RootDirectorView} from "../rootDirector/rootDirector.view";
import {ToolPanel} from "../../panels/toolPanel/toolPanel";
import {Canvas} from "../../screens/canvas/canvas";
import {Camera} from "../../screens/camera/camera";
import {Grid} from "../../screens/grid/grid";

export class ProjectView extends RootDirectorView<Project, ProjectModel> {
    //Parents used to segregate different types of elements placed on the canvas
    //Mainly to make sure that flows are below cards
    public cardsParent: HTMLElement;
    public flowsParent: HTMLElement;

    public toolPanel: ToolPanel<ToolType>;

    public initialize() {
        super.initialize();
        this.element.childHandler = this.content;
    }

    protected setupUIElements() {
        super.setupUIElements();

        this.element.screensParent = this.content;

        this.cardsParent = div();
        this.flowsParent = div();

        this.toolPanel = new ToolPanel({director: this.element});

        // this.element.addScreen(new Canvas(this.element), ProjectScreens.canvas); //TODO where does this go
        this.element.addScreen(new Grid(this.element), ProjectScreens.grid);
        this.element.addScreen(new Camera(this.element), ProjectScreens.camera);
        console.log("screens added")
    }

    protected setupUILayout() {
        super.setupUILayout();

        this.element.addChild(this.toolPanel);
        // this.element.canvas.content.addChild([this.flowsParent, this.cardsParent]); //TODO where does this go
        this.element.grid.content.addChild([this.flowsParent, this.cardsParent]);
    }
}