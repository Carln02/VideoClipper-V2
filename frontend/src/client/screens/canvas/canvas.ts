import {ClickMode, css, define, div, Point, ToolManager} from "turbodombuilder";
import "./canvas.css";
import {Toolbar} from "../../components/toolbar/toolbar";
import {NavigatorTool} from "../../tools/navigator/navigator";
import {NavigationManager} from "../../managers/navigationManager/navigationManager";
import {VcComponent} from "../../components/component/component";
import {Project} from "../../directors/project/project";
import {ProjectScreens, Substrate, ToolType} from "../../directors/project/project.types";
import {ShootTool} from "../../tools/shoot/shoot";
import {NavigatableElement} from "../../managers/navigationManager/navigationManager.types";
import {SelectionTool} from "../../tools/selection/selection";
import {ConnectionTool} from "../../tools/connection/connection";

/**
 * @description Class representing a canvas on which the user can add cards, connect them, move them around, etc.
 */
@define("vc-canvas")
export class Canvas extends VcComponent<any, any, any, Project>  implements Substrate {
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
        this.toolbar = new Toolbar({
            parent: this,
            classes: "bottom-toolbar",
            director: this.director,
            tools: [
                new SelectionTool({name: ToolType.selection, toolManager: this.toolManager, director: this.director, key: "Shift"}),
                new NavigatorTool({name: ToolType.navigator, toolManager: this.toolManager, director: this.director}),
                ToolType.createCard,
                ToolType.createText,
                ToolType.delete,
                new ConnectionTool({name: ToolType.connection, toolManager: this.toolManager, director: this.director}),
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
