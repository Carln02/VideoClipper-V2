import {RendererView} from "../renderer/renderer.view";
import {ClipRenderer} from "./clipRenderer";
import {ClipRendererModel} from "./clipRenderer.model";
import {TextType} from "../textElement/textElement.types";
import {div, video} from "turbodombuilder";
import {TextElement} from "../textElement/textElement";

export class ClipRendererView extends RendererView<ClipRenderer, ClipRendererModel> {
    public textParent: HTMLDivElement;

    protected setupChangedCallbacks() {
        super.setupChangedCallbacks();
        this.emitter.add("title", () => {
            const entries = this.model.textElements
                .filter(textElement => textElement.type == TextType.title);
            if (entries.length == 0) return;
            entries.forEach(entry => entry.textValue = this.model.cardTitle);
        });
    }

    protected setupUIElements() {
        super.setupUIElements();
        this.textParent = div();
        for (let i = 0; i < this.model.videoElementsCount; i++) this.videos.push(video());
    }

    protected setupUILayout() {
        super.setupUILayout();
        this.element.addChild(this.videos);
        this.element.addChild([this.canvas, this.textParent]);
    }

    public addTextElement(element: TextElement, id?: number) {
        this.textParent.addChild(element, id);
    }
}