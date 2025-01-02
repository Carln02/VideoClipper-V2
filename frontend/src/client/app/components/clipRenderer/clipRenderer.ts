import {auto, define, TurboProperties} from "turbodombuilder";
import {TextElement} from "../textElement/textElement";
import {Renderer} from "../../abstract/renderer/renderer";
import {ClipRendererView} from "./clipRenderer.view";
import {ClipRendererModel} from "./clipRenderer.model";
import {Clip} from "../clip/clip";
import {Card} from "../card/card";
import {RendererProperties} from "../../abstract/renderer/renderer.types";

@define("vc-clip-renderer")
export class ClipRenderer extends Renderer<ClipRendererView, ClipRendererModel> {
    constructor(properties: RendererProperties<ClipRendererView, ClipRendererModel> = {}) {
        super(properties);
        this.generateViewAndModel(ClipRendererView, ClipRendererModel, undefined, false);

        this.model.onTextAdded = (syncedText, id) => {
            const text = new TextElement({data: syncedText, renderer: this});
            this.view.addTextElement(text, id);
            return text;
        };

        this.initialize();

        this.view.canvas.setProperties(properties.canvasProperties);
        this.view.videos.forEach((video: HTMLVideoElement) => video.setProperties(properties.videoProperties));
        this.view.resize();
    }

    public get currentClip(): Clip {
        return this.view.currentClip;
    }

    @auto()
    public set card(value: Card) {
        this.model.cardData = value.data;
    }

    public async setFrame(clip: Clip = this.view.currentClip, offsetTime: number = 0, force: boolean = false,
                          forceCanvas: boolean = false) {
        await this.view.setFrame(clip, offsetTime, force, forceCanvas);
    }
}