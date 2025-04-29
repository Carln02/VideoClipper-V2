import {auto, define} from "turbodombuilder";
import {TextElement} from "../textElement/textElement";
import {Renderer} from "../renderer/renderer";
import {ClipRendererView} from "./clipRenderer.view";
import {ClipRendererModel} from "./clipRenderer.model";
import {Card} from "../card/card";
import {RendererProperties} from "../renderer/renderer.types";
import {RendererDrawingController} from "../renderer/renderer.drawingController";
import {ClipRendererVideoController} from "./clipRenderer.videoController";
import {ClipRendererVisibilityController} from "./clipRenderer.visibilityController";
import {Clip} from "../clip/clip";
import {ClipRendererFrameController} from "./clipRenderer.frameController";
import {RendererCanvasController} from "../renderer/renderer.canvasController";
import domToImage from "dom-to-image-more";
import {ClipRendererVisibility} from "./clipRenderer.types";

@define("vc-clip-renderer")
export class ClipRenderer extends Renderer<ClipRendererView, ClipRendererModel> {
    public constructor(properties: RendererProperties<ClipRendererView, ClipRendererModel> = {}) {
        properties.generate = false;
        super(properties);
        this.mvc.generate({
            viewConstructor: ClipRendererView,
            modelConstructor: ClipRendererModel,
            controllerConstructors: [RendererDrawingController, RendererCanvasController,
                ClipRendererFrameController, ClipRendererVisibilityController, ClipRendererVideoController],
            initialize: false
        });

        this.model.onTextAdded = (syncedText, id) => {
            const text = new TextElement({data: syncedText, renderer: this, screenManager: this.screenManager});
            this.view.addTextElement(text, id);
            return text;
        };

        this.mvc.initialize();
        this.view.canvas.setProperties(properties.canvasProperties);
        this.view.videos.forEach((video: HTMLVideoElement) => video.setProperties(properties.videoProperties));
    }

    protected get frameController(): ClipRendererFrameController {
        return this.mvc.getController("frame") as ClipRendererFrameController;
    }

    protected get videoController(): ClipRendererVideoController {
        return this.mvc.getController("video") as ClipRendererVideoController;
    }

    public connectedCallback() {
        this.canvasController?.resize();
        this.canvasController?.refreshCanvas();
    }

    public set visibilityMode(value: ClipRendererVisibility) {
        this.model.visibilityMode = value;
    }
    
    public get visibilityMode(): ClipRendererVisibility {
        return this.model.visibilityMode;
    }

    @auto()
    public set card(value: Card) {
        this.model.cardData = value.data;
    }

    public get clip(): Clip {
        return this.model.getClip();
    }

    public async setFrame(clip: Clip = this.model.getClip(), offsetTime: number = 0) {
        await this.frameController.setFrame(clip, offsetTime);
    }

    public async drawFrame(clip: Clip = this.model.getClip(), offset: number = 0): Promise<string> {
        await this.frameController.setFrame(clip, offset, true, true);
        await new Promise((resolve) => setTimeout(() => resolve(null), 500));
        return await domToImage.toJpeg(this, {quality: 0.6});
    }

    public play() {
        this.videoController.play();
    }

    public pause() {
        this.videoController.pause();
    }

    public async loadNext(clip: Clip, offset: number = 0) {
        await this.videoController.loadNext(clip, offset);
    }

    public async playNext() {
        await this.videoController.playNext();
    }
}