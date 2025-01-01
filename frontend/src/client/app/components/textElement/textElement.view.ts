import {YView} from "../../../../yManagement/yMvc/yView";
import {TextElementModel} from "./textElement.model";
import {TextElement} from "./textElement";
import {TextType} from "./textElement.types";
import {Coordinate, span, TurboEvent, TurboEventName} from "turbodombuilder";
import {Resizer} from "../basicComponents/resizer/resizer";
import {ContextManager} from "../../managers/contextManager/contextManager";
import {ContextView} from "../../managers/contextManager/contextManager.types";
import {ToolManager} from "../../managers/toolManager/toolManager";
import {ToolType} from "../../managers/toolManager/toolManager.types";

export class TextElementView extends YView<TextElement, TextElementModel> {
    private content: HTMLSpanElement;
    private _resizer: Resizer;

    public get resizer(): Resizer {
        return this._resizer;
    }

    protected set resizer(value: Resizer) {
        this._resizer = value;
    }

    protected setupUIElements() {
        super.setupUIElements();
        this.content = span({contentEditable: "true", role: "textbox"});
        if (this.element.renderer) this.resizer = new Resizer(this.element);
    }

    protected setupUILayout() {
        super.setupUILayout();
        this.element.addChild([this.content, this.resizer]);
    }

    protected setupUIListeners() {
        super.setupUIListeners();

        this.element.addEventListener(TurboEventName.click, (e: TurboEvent) => {
            if (ContextManager.instance.view != ContextView.camera) return;
            if (ToolManager.instance.getFiredTool(e).name != ToolType.text) return;
            this.content.focus();
            e.stopImmediatePropagation();
        });

        this.element.addEventListener("blur", () => {
            if (this.model.type == TextType.custom) this.model.text = this.content.textContent;
        });
    }

    public get textValue(): string {
        return this.content.textContent;
    }

    public set textValue(value: string) {
        this.content.textContent = value;
    }

    public typeChanged(value: TextType) {
        switch (value.valueOf()) {
            case TextType.timestamp:
                this.textValue = this.element.card.metadata.timestamp;
                return;
            case TextType.title:
                this.textValue = this.element.card.title;
                return;
            default:
                this.textValue = this.model.text;
                return;
        }
    }

    public originChanged(value: Coordinate) {
        this.element.setStyle("transform", `translate3d(calc(${(value.x * this.element.renderer.width) || 0}px - 50%), 
                        calc(${(value.y * this.element.renderer.height) || 0}px - 50%), 0)`);
    }

    public fontSizeChanged(value: number) {
        this.content.setStyle("fontSize", value * this.element.renderer.offsetHeight + "px");
    }

    public textChanged(value: string) {
        if (this.model.type == TextType.custom) this.element.textContent = value;
    }

    public boxWidthChanged(value: number) {
        this.element.setStyle("width", value + "%");
    }

    public boxHeightChanged(value: number) {
        this.element.setStyle("height", value + "%");
    }
}