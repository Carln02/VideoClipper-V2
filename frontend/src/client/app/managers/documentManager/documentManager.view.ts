import {div, TurboView} from "turbodombuilder";
import {DocumentManager} from "./documentManager";
import {DocumentManagerModel} from "./documentManager.model";
import {ToolPanel} from "../../panels/toolPanel/toolPanel";
import {Camera} from "../../screens/camera/camera";
import {DocumentScreens} from "./documentManager.types";
import {Canvas} from "../../screens/canvas/canvas";

export class DocumentManagerView extends TurboView<DocumentManager, DocumentManagerModel> {
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

        this.element.addScreen(new Canvas(this.element), DocumentScreens.canvas);
        this.element.addScreen(new Camera(this.element), DocumentScreens.camera);
    }

    protected setupUILayout() {
        super.setupUILayout();

        this.element.addChild([this.screenParent, this.toolPanel]);
        this.element.canvas.content.addChild([this.flowsParent, this.cardsParent]);
    }
}