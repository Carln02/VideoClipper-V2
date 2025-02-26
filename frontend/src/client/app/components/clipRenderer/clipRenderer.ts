import {auto, define} from "turbodombuilder";
import {TextElement} from "../textElement/textElement";
import {Renderer} from "../../abstract/renderer/renderer";
import {ClipRendererView} from "./clipRenderer.view";
import {ClipRendererModel} from "./clipRenderer.model";
import {Clip} from "../clip/clip";
import {Card} from "../card/card";
import {RendererProperties} from "../../abstract/renderer/renderer.types";
import {ClipRendererVisibility} from "./clipRenderer.types";

@define("vc-clip-renderer")
export class ClipRenderer extends Renderer<ClipRendererView, ClipRendererModel> {
    constructor(properties: RendererProperties<ClipRendererView, ClipRendererModel> = {}) {
        super(properties);
        this.generateMvc(ClipRendererView, ClipRendererModel, undefined, false);

        this.model.onTextAdded = (syncedText, id) => {
            const text = new TextElement({data: syncedText, renderer: this});
            this.view.addTextElement(text, id);
            return text;
        };

        this.initializeMvc();

        this.view.canvas.setProperties(properties.canvasProperties);
        this.view.videos.forEach((video: HTMLVideoElement) => video.setProperties(properties.videoProperties));
        this.view.resize();
    }

    public get currentClip(): Clip {
        return this.view.currentClip;
    }

    public get visibilityMode(): ClipRendererVisibility {
        return this.view.visibilityMode;
    }

    @auto()
    public set card(value: Card) {
        this.model.cardData = value.data;
    }

    public async setFrame(clip: Clip = this.view.currentClip, offsetTime: number = 0, force: boolean = false,
                          forceCanvas: boolean = false) {
        await this.view.setFrame(clip, offsetTime, force, forceCanvas);
    }

    public play() {
        this.view.videoManager.play();
    }

    public pause() {
        this.view.videoManager.pause();
    }

    public playNext() {
        this.view.videoManager.playNext();
    }

    public loadNext(clip: Clip, offset?: number) {
        this.view.videoManager.loadNext(clip, offset);
    }
}