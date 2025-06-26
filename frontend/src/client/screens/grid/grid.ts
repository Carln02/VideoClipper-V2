import {VcComponent} from "../../components/component/component";
import {Project} from "../../directors/project/project";
import {ClickMode, css, define, div, Point, ToolManager} from "turbodombuilder";
import { NavigationManager } from "../../managers/navigationManager/navigationManager";
import { Toolbar } from "../../components/toolbar/toolbar";
import { NavigatableElement } from "../../managers/navigationManager/navigationManager.types";
import {ProjectScreens, ToolType} from "../../directors/project/project.types";
import {ShootTool} from "../../tools/shoot/shoot";
import {NavigatorTool} from "../../tools/navigator/navigator";

@define("vc-grid")
export class Grid extends VcComponent<any, any, any, Project> implements NavigatableElement {
    //Grid parent --> contains the main components that are translated/scaled
    public readonly content: HTMLDivElement;

    public readonly navigationManager: NavigationManager;

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
                {name: ToolType.selection, key: "Shift"},
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