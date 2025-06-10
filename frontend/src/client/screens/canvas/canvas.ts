import {ClickMode, css, define, div, Point} from "turbodombuilder";
import "./canvas.css";
import {Toolbar} from "../../components/toolbar/toolbar";
import {SelectionTool} from "../../tools/selection/selection";
import {NavigatorTool} from "../../tools/navigator/navigator";
import {CreateCardTool} from "../../tools/createCard/createCard";
import {ConnectionTool} from "../../tools/connection/connection";
import {TextTool} from "../../tools/text/text";
import {ShootTool} from "../../tools/shoot/shoot";
import {DeleteTool} from "../../tools/delete/delete";
import {NavigationManager} from "../../managers/navigationManager/navigationManager";
import {ToolManager} from "../../managers/toolManager/toolManager";
import {VcComponent} from "../../components/component/component";
import {Project} from "../../directors/project/project";
import {ProjectScreens} from "../../directors/project/project.types";

/**
 * @description Class representing a canvas on which the user can add cards, connect them, move them around, etc.
 */
@define("vc-canvas")
export class Canvas extends VcComponent<any, any, any, Project> {
    //Canvas parent --> contains the main components that are translated/scaled
    public readonly content: HTMLDivElement;

    //Canvas's attached navigation manager
    public readonly navigationManager: NavigationManager;

    //Main toolbar
    private readonly toolbar: Toolbar;

    public constructor(document: Project) {
        super({director: document});

        this.content = div({parent: this, id: "canvas-content"});

        //Init navigation manager
        this.navigationManager = new NavigationManager(this);

        //Init toolbar
        this.toolbar = new Toolbar({parent: this, classes: "bottom-toolbar", director: this.director});

        this.initTools();
    }

    public get toolManager(): ToolManager {
        return this.director.toolManager;
    }

    private initTools() {
        //Create all tools
        this.toolManager.addTool(new SelectionTool(this.director), "Shift");
        this.toolManager.addTool(new NavigatorTool(this.director), "Control");
        this.toolManager.addTool(new CreateCardTool(this.director));
        this.toolManager.addTool(new ConnectionTool(this.director));
        this.toolManager.addTool(new TextTool(this.director));
        this.toolManager.addTool(new ShootTool(this.director));
        this.toolManager.addTool(new DeleteTool(this.director));

        //Init default tools at hand
        this.toolManager.setTool(this.toolManager.getToolByKey("Shift"), ClickMode.left);
        this.toolManager.setTool(this.toolManager.getToolByKey("Control"), ClickMode.middle, {select: false, activate: false});
        this.toolbar.populateWithAllTools();
    }

    public remove(): this {
        super.remove();
        return this;
    }

    public get scale() {
        if (this.director.currentType !== ProjectScreens.canvas) return 1;
        return this.navigationManager.scale;
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
