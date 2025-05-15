import {RendererView} from "../renderer/renderer.view";
import {ClipRenderer} from "./clipRenderer";
import {ClipRendererModel} from "./clipRenderer.model";
import {TextType} from "../textElement/textElement.types";
import {div} from "turbodombuilder";
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
    }

    protected setupUILayout() {
        super.setupUILayout();
        this.element.addChild(this.textParent);
    }

    public addTextElement(element: TextElement, id?: number) {
        this.textParent.addChild(element, id);
    }

    public showCurrentVideo() {
        this.videos.forEach((video: HTMLVideoElement, index: number) => video.show(index == this.model.currentIndex));
    }

    public resize(aspectRatio: number = 1.33, width: number = this.element.offsetWidth, height: number = this.element.offsetHeight) {
        super.resize(aspectRatio, width, height);
        if (width / height <= aspectRatio) height = width / aspectRatio;
        else width = height * aspectRatio;
        this.textParent.setStyles(`width: ${width}px; height: ${height}px`);
    }
}