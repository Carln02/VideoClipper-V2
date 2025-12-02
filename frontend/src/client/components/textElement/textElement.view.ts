import {TextElementModel} from "./textElement.model";
import {TextElement} from "./textElement";
import {TextType} from "./textElement.types";
import {effect, span, turbo, TurboEvent, TurboEventName, TurboView} from "turbodombuilder";
import {resizer, Resizer} from "../basicComponents/resizer/resizer";
import {ProjectScreens, ToolType} from "../../directors/project/project.types";

export class TextElementView extends TurboView<TextElement, TextElementModel> {
    private content: HTMLSpanElement;
    public resizer: Resizer;

    protected setupUIElements() {
        super.setupUIElements();
        this.content = span({contentEditable: "true", role: "textbox"});
        if (this.element.renderer) this.resizer = resizer({content: this.element});
    }

    protected setupUILayout() {
        super.setupUILayout();
        turbo(this).addChild([this.content, this.resizer]);
    }

    protected setupUIListeners() {
        super.setupUIListeners();

        this.element.addEventListener(TurboEventName.click, (e: TurboEvent) => {
            if (this.element.director.currentType != ProjectScreens.camera) return;
            if (e.toolName != ToolType.createText) return;
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

    @effect private updateType() {
        if (!this.model.type) return;
        switch (this.model.type?.valueOf()) {
            case TextType.timestamp:
                this.textValue = this.element.card?.metadata.timestamp;
                return;
            case TextType.title:
                this.textValue = this.element.card?.title;
                return;
            default:
                this.textValue = this.model.text;
                return;
        }
    }

    @effect private updateOrigin() {
        if (!this.model.origin) return;
        turbo(this).setStyle("transform", `translate3d(
            calc(${(this.model.origin.x * this.element.renderer.width) || 0}px - 50%), 
            calc(${(this.model.origin.y * this.element.renderer.height) || 0}px - 50%), 
        0)`);
    }

    @effect private updateFontSize() {
        turbo(this.content).setStyle("fontSize", this.model.fontSize * this.element.renderer.offsetHeight + "px");
    }

    @effect private updateText() {
        this.model.text;
        if (this.model.type == TextType.custom) this.content.textContent = this.model.text;
    }

    @effect private updateBoxWidth() {
        turbo(this).setStyle("width", this.model.boxWidth + "%");
    }

    @effect private updateBoxHeight() {
        turbo(this).setStyle("height", this.model.boxHeight + "%");
    }
}