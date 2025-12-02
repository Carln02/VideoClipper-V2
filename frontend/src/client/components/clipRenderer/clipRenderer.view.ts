import {RendererView} from "../renderer/renderer.view";
import {ClipRenderer} from "./clipRenderer";
import {ClipRendererModel} from "./clipRenderer.model";
import {SyncedText, TextType} from "../textElement/textElement.types";
import {DataBlockObserver, div, effect, turbo} from "turbodombuilder";
import {textElement, TextElement} from "../textElement/textElement";

export class ClipRendererView extends RendererView<ClipRenderer, ClipRendererModel> {
    public textParent: HTMLDivElement;
    protected textObserver: DataBlockObserver<SyncedText, TextElement, number>;

    protected setupUIElements() {
        super.setupUIElements();
        this.textParent = div();
    }

    protected setupUILayout() {
        super.setupUILayout();
        turbo(this).addChild(this.textParent);
    }

    protected setupChangedCallbacks() {
        this.textObserver = this.model.textBlock.generateObserver({onAdded: (syncedText, id) => {
                const text = textElement({renderer: this.element, director: this.element.director});
                this.addTextElement(text, id);
                return text;
            }})

        super.setupChangedCallbacks();
    }

    public addTextElement(element: TextElement, id?: number) {
        turbo(this.textParent).addChild(element, id);
    }

    public showVideo(index: number = this.model.currentIndex) {
        this.videos.forEach((video: HTMLVideoElement, i: number) => turbo(video).show(index == i));
    }

    public resize(aspectRatio: number = 1.33, width: number = this.element.offsetWidth, height: number = this.element.offsetHeight) {
        super.resize(aspectRatio, width, height);
        if (width / height <= aspectRatio) height = width / aspectRatio;
        else width = height * aspectRatio;
        turbo(this.textParent).setStyles(`width: ${width}px; height: ${height}px`);
    }

    @effect private updateCardTitle() {
        const entries = this.textObserver?.getAllInstances()
            .filter(textElement => textElement.type == TextType.title);
        if (entries.length == 0) return;
        entries.forEach(entry => entry.textValue = this.model.cardTitle);
    }
}