import {TextElementModel} from "./textElement.model";
import {TextElement} from "./textElement";
import {TextType} from "./textElement.types";
import {Coordinate, span, TurboEvent, TurboEventName, TurboView} from "turbodombuilder";
import {Resizer} from "../basicComponents/resizer/resizer";
import {ToolType} from "../../managers/toolManager/toolManager.types";
import {ProjectScreens} from "../../screens/project/project.types";

export class TextElementView extends TurboView<TextElement, TextElementModel> {
    private content: HTMLSpanElement;
    private _resizer: Resizer;

    public get resizer(): Resizer {
        return this._resizer;
    }

    protected set resizer(value: Resizer) {
        this._resizer = value;
    }

    protected setupChangedCallbacks() {
        super.setupChangedCallbacks();

        this.emitter.add("type", (value: TextType) => {
            switch (value.valueOf()) {
                case TextType.timestamp:
                    this.textValue = this.element.card.metadata.timestamp;
                    return;
                case TextType.title:
                    this.textValue = this.element.card?.title;
                    return;
                default:
                    this.textValue = this.model.text;
                    return;
            }
        });

        this.emitter.add("origin", (value: Coordinate) => this.element.setStyle("transform",
            `translate3d(calc(${(value.x * this.element.renderer.width) || 0}px - 50%), 
                        calc(${(value.y * this.element.renderer.height) || 0}px - 50%), 0)`));

        this.emitter.add("fontSize", (value: number) => this.content
            .setStyle("fontSize", value * this.element.renderer.offsetHeight + "px"));

        this.emitter.add("text", (value: string) => {
            if (this.model.type == TextType.custom) this.content.textContent = value;
        });

        this.emitter.add("boxWidth", (value: number) => this.element.setStyle("width", value + "%"));
        this.emitter.add("boxHeight", (value: number) => this.element.setStyle("height", value + "%"));
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
            if (this.element.screenManager.currentType != ProjectScreens.camera) return;
            if (this.element.screenManager.toolManager.getFiredTool(e).name != ToolType.text) return;
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
}