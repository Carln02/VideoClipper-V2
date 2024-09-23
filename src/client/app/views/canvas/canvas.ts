import {css, define, div, Point, TurboElement} from "turbodombuilder";
import {NavigationManager} from "./managers/navigationManager/navigationManager";
import "./canvas.css";
import {Toolbar} from "../../components/toolbar/toolbar";
import {ContextManager} from "../../managers/contextManager/contextManager";
import {ContextView} from "../../managers/contextManager/contextManager.types";
import {AppBar} from "../../components/appBar/appBar";
import {SyncedDocumentData} from "./canvas.types";
import {Card} from "../../components/card/card";
import {SyncedCard} from "../../components/card/card.types";
import {SyncedBranchingNode} from "../../components/branchingNode/branchingNode.types";
import {BranchingNode} from "../../components/branchingNode/branchingNode";
import {SyncedFlow} from "../../components/flow/flow.types";
import {Flow} from "../../components/flow/flow";
import {YPath, YProxied, YProxyEventName} from "../../../../yProxy";

/**
 * @description Class representing a canvas on which the user can add cards, connect them, move them around, etc.
 */
@define("vc-canvas")
export class Canvas extends TurboElement {
    //Singleton
    private static _instance: Canvas = null;

    private data: SyncedDocumentData;

    private appBar: AppBar;

    //Canvas parent --> contains the main components that are translated/scaled
    public readonly content: HTMLDivElement;

    //Parents used to segregate different types of elements placed on the canvas
    //Mainly to make sure that flows are below cards
    public readonly cardsParent: HTMLDivElement;
    public readonly flowsParent: HTMLDivElement;

    //Canvas's attached navigation manager
    public readonly navigationManager: NavigationManager;

    //Main toolbar
    private readonly toolbar: Toolbar;

    constructor(data: SyncedDocumentData) {
        ContextManager.instance.view = ContextView.canvas;

        //Cancel construction if exists already
        if (Canvas.instance) {
            if (Canvas.instance.parentElement == null) {
                document.body.addChild(Canvas.instance);
                Canvas.instance.clear();
            }
            return Canvas.instance;
        }

        super({parent: document.body});
        Canvas.instance = this;

        // this.data = data;

        this.appBar = new AppBar({parent: this});

        this.content = div({parent: this, id: "canvas-content"});

        //Init parents
        this.flowsParent = div({parent: this.content});
        this.cardsParent = div({parent: this.content});

        //Init navigation manager
        this.navigationManager = new NavigationManager(this);

        //Init toolbar
        this.toolbar = new Toolbar({parent: this, classes: "bottom-toolbar"});
        this.toolbar.populateWithAllTools();

        this.data = data;
        this.setupCallbacks();

    }

    protected setupCallbacks() {
        const creationCallback = <DataType extends YProxied>
        (constructor: new (...args: unknown[]) => HTMLElement, parent: HTMLElement) =>
            (newValue: DataType, oldValue: DataType, _isLocal: boolean, path: YPath) => {
                if (path[path.length - 1].toString().startsWith("__yWrap__")) return;
                oldValue?.destroyBoundObjects();
                new constructor(newValue, parent);
            };

        this.data.cards.bind(YProxyEventName.entryAdded,
            creationCallback<SyncedCard>(Card, this.cardsParent), this);
        this.data.flows.bind(YProxyEventName.entryAdded,
            creationCallback<SyncedFlow>(Flow, this.flowsParent), this);
        this.data.branchingNodes.bind(YProxyEventName.entryAdded,
            creationCallback<SyncedBranchingNode>(BranchingNode, this.cardsParent), this);
    }

    private clear() {
        for (const card of Object.values(this.data.cards.value)) card.destroyBoundObjects();
        for (const flow of Object.values(this.data.flows.value)) flow.destroyBoundObjects();
        for (const branchingNode of Object.values(this.data.branchingNodes.value)) branchingNode.destroyBoundObjects();
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
