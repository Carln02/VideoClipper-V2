import {auto, ClickMode, css, define, div, Point, TurboElement} from "turbodombuilder";
import {NavigationManager} from "./managers/navigationManager/navigationManager";
import "./canvas.css";
import {Toolbar} from "../../components/toolbar/toolbar";
import {ContextManager} from "../../managers/contextManager/contextManager";
import {ContextView} from "../../managers/contextManager/contextManager.types";
import {AppBar} from "../../components/appBar/appBar";
import {DocumentManager} from "./managers/documentManager/documentManager";
import {SelectionTool} from "../../tools/selection/selection";
import {NavigatorTool} from "../../tools/navigator/navigator";
import {CreateCardTool} from "../../tools/createCard/createCard";
import {ConnectionTool} from "../../tools/connection/connection";
import {TextTool} from "../../tools/text/text";
import {ShootTool} from "../../tools/shoot/shoot";
import {DeleteTool} from "../../tools/delete/delete";
import {ToolManager} from "../../managers/toolManager/toolManager";

/**
 * @description Class representing a canvas on which the user can add cards, connect them, move them around, etc.
 */
@define("vc-canvas")
export class Canvas extends TurboElement {
    //Singleton
    private static _instance: Canvas = null;

    private appBar: AppBar;

    //Canvas parent --> contains the main components that are translated/scaled
    public readonly content: HTMLDivElement;

    //Canvas's attached navigation manager
    public readonly navigationManager: NavigationManager;

    //Main toolbar
    private readonly toolbar: Toolbar;

    constructor() {
        ContextManager.instance.view = ContextView.canvas;

        //Cancel construction if exists already
        if (Canvas.instance) {
            if (Canvas.instance.parentElement == null) {
                document.body.addChild(Canvas.instance);
                Canvas.instance.documentManager.clear();
            }
            return Canvas.instance;
        }

        super({parent: document.body});
        Canvas.instance = this;

        this.appBar = new AppBar({parent: this});

        this.content = div({parent: this, id: "canvas-content"});

        //Init navigation manager
        this.navigationManager = new NavigationManager(this);

        //Init toolbar
        this.toolbar = new Toolbar({parent: this, classes: "bottom-toolbar"});
    }

    private initTools() {
        //Create all tools
        ToolManager.instance.addTool(new SelectionTool(this.documentManager), "Shift");
        ToolManager.instance.addTool(new NavigatorTool(this.documentManager), "Control");
        ToolManager.instance.addTool(new CreateCardTool(this.documentManager));
        ToolManager.instance.addTool(new ConnectionTool(this.documentManager));
        ToolManager.instance.addTool(new TextTool(this.documentManager));
        ToolManager.instance.addTool(new ShootTool(this.documentManager));
        ToolManager.instance.addTool(new DeleteTool(this.documentManager));

        //Init default tools at hand
        ToolManager.instance.setTool(ToolManager.instance.getToolByKey("Shift"), ClickMode.left);
        ToolManager.instance.setTool(ToolManager.instance.getToolByKey("Control"), ClickMode.middle, {select: false, activate: false});
        this.toolbar.populateWithAllTools();
    }

    @auto()
    public set documentManager(value: DocumentManager) {
        this.content.addChild([value.flowsParent, value.cardsParent]);
        this.initTools();
    }

    public remove(): this {
        super.remove();
        ContextManager.instance.view = ContextView.home;
        return this;
    }

    /**
     * @description The singleton instance.
     */
    public static get instance() {
        return this._instance;
    }

    private static set instance(value: Canvas) {
        this._instance = value;
    }

    public get scale() {
        if (ContextManager.instance.view != ContextView.canvas) return 1;
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
