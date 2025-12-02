import {ClickMode, css, define, div, element, Point, turbo, TurboEventManager} from "turbodombuilder";
import "./canvas.css";
import {toolbar, Toolbar} from "../../components/toolbar/toolbar";
import {NavigationManager} from "../../managers/navigationManager/navigationManager";
import {VcComponent} from "../../components/component/component";
import {Project} from "../../directors/project/project";
import {ProjectScreens, ToolType} from "../../directors/project/project.types";
import {NavigatableElement} from "../../managers/navigationManager/navigationManager.types";
import {VcProperties} from "../../components/component/component.types";
import {CreateCardTool} from "../../tools/createCard/createCard.tool";
import {ShootTool} from "../../tools/shoot/shoot.tool";
import {DeleteTool} from "../../tools/delete/delete.tool";
import {AddTextTool} from "../../tools/addText/addText.tool";
import {selectionTool} from "../../tools/selection/selection";
import {NavigatorTool} from "../../tools/navigator/navigator";
import {connectionTool} from "../../tools/connection/connection";
import {tool} from "../../components/tool/tool";

/**
 * @description Class representing a canvas on which the user can add cards, connect them, move them around, etc.
 */
@define("vc-canvas")
export class Canvas extends VcComponent<any, any, any, Project>  implements NavigatableElement {
    //Canvas parent --> contains the main components that are translated/scaled
    private _content: HTMLDivElement;
    public get content(): HTMLDivElement {
        return this._content;
    }

    //Canvas's attached navigation manager
    public navigationManager: NavigationManager;

    //Main toolbar
    private toolbar: Toolbar;

    public initialize() {
        super.initialize();
        this.navigationManager = new NavigationManager(this);
        this.initTools();
    }

    protected setupUIElements() {
        super.setupUIElements();
        this._content = div({id: "canvas-content"});

        this.toolbar = toolbar({classes: "bottom-toolbar", director: this.director});
        this.toolbar.addTools(
            selectionTool({text: ToolType.selection, director: this.director}),
            tool({text: ToolType.navigator, tools: NavigatorTool, director: this.director}),
            tool({text: ToolType.createCard, tools: CreateCardTool, director: this.director}),
            tool({text: ToolType.createText, tools: AddTextTool, director: this.director}),
            tool({text: ToolType.delete, tools: DeleteTool, director: this.director}),
            connectionTool({text: ToolType.connection, director: this.director}),
            tool({text: ToolType.shoot, tools: ShootTool, director: this.director}),
        );

    }

    protected setupUILayout() {
        super.setupUILayout();
        turbo(this).addChild([this.content, this.toolbar]);
    }

    private initTools() {
        //Create all tools
        // this.toolManager.addTool(new ConnectionTool(this.director));

        //Init default tools at hand
        TurboEventManager.instance.setTool(TurboEventManager.instance.getToolByKey("Shift"), ClickMode.left);
        TurboEventManager.instance.setTool(TurboEventManager.instance.getToolByKey("Control"), ClickMode.middle, {select: false, activate: false});
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
        turbo(this.content).setStyle("transform", css`translate3d(${translation.x}px, ${translation.y}px, 0) scale3d(${scale}, ${scale}, 1)`);
    }
}

export function vcCanvas(properties: VcProperties<any, any, any, Project>): Canvas {
    turbo(properties).applyDefaults({tag: "vc-canvas"});
    return element({...properties}) as Canvas;
}
