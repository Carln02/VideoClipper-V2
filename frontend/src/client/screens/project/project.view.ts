import {div, TurboView} from "turbodombuilder";
import {Project} from "./project";
import {ToolPanel} from "../../panels/toolPanel/toolPanel";
import {Canvas} from "../canvas/canvas";
import {Camera} from "../camera/camera";
import {ProjectModel} from "./project.model";
import {ProjectScreens} from "./project.types";

export class ProjectView extends TurboView<Project, ProjectModel> {
    private screenParent: HTMLElement;

    //Parents used to segregate different types of elements placed on the canvas
    //Mainly to make sure that flows are below cards
    public cardsParent: HTMLElement;
    public flowsParent: HTMLElement;

    public toolPanel: ToolPanel;

    initialize() {
        super.initialize();
        this.element.childHandler = this.screenParent;
    }

    protected setupUIElements() {
        super.setupUIElements();

        this.screenParent = div();
        this.element.screensParent = this.screenParent;

        this.cardsParent = div();
        this.flowsParent = div();

        this.toolPanel = new ToolPanel({screenManager: this.element});

        this.element.addScreen(new Canvas(this.element), ProjectScreens.canvas);
        this.element.addScreen(new Camera(this.element), ProjectScreens.camera);
    }

    protected setupUILayout() {
        super.setupUILayout();

        this.element.addChild([this.screenParent, this.toolPanel]);
        this.element.canvas.content.addChild([this.flowsParent, this.cardsParent]);
    }
}