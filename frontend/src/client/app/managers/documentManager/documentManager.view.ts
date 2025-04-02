import {div, TurboView} from "turbodombuilder";
import {DocumentManager} from "./documentManager";
import {DocumentManagerModel} from "./documentManager.model";
import {ToolPanel} from "../../panels/toolPanel/toolPanel";
import {Canvas} from "../../views/canvas/canvas";
import {Camera} from "../../views/camera/camera";

export class DocumentManagerView extends TurboView<DocumentManager, DocumentManagerModel> {
    private screenParent: HTMLElement;

    //Parents used to segregate different types of elements placed on the canvas
    //Mainly to make sure that flows are below cards
    public cardsParent: HTMLElement;
    public flowsParent: HTMLElement;

    public canvas: Canvas;
    public camera: Camera;

    public toolPanel: ToolPanel;

    protected setupUIElements() {
        super.setupUIElements();

        this.screenParent = div();

        this.cardsParent = div();
        this.flowsParent = div();

        this.toolPanel = new ToolPanel();
        this.canvas = new Canvas(this.element);
        this.camera = new Camera(this.element);
    }

    protected setupUILayout() {
        super.setupUILayout();

        this.element.addChild([this.screenParent, this.toolPanel]);
        this.screenParent.addChild([this.canvas, this.camera]);
        this.canvas.content.addChild([this.flowsParent, this.cardsParent]);
    }
}