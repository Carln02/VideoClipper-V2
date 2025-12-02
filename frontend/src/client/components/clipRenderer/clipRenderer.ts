import {auto, controller, define, expose, turbo} from "turbodombuilder";
import {renderer, Renderer} from "../renderer/renderer";
import {ClipRendererView} from "./clipRenderer.view";
import {ClipRendererModel} from "./clipRenderer.model";
import {Card} from "../card/card";
import {RendererProperties} from "../renderer/renderer.types";
import {ClipRendererVideoController} from "./clipRenderer.videoController";
import {ClipRendererVisibilityController} from "./clipRenderer.visibilityController";
import {Clip} from "../clip/clip";
import {ClipRendererFrameController} from "./clipRenderer.frameController";
import domToImage from "dom-to-image-more";
import {ClipRendererVisibility} from "./clipRenderer.types";

@define("vc-clip-renderer")
export class ClipRenderer extends Renderer<ClipRendererView, ClipRendererModel> {
    @controller() protected frameController: ClipRendererFrameController;
    @controller() protected videoController: ClipRendererVideoController;

    @expose("model") public accessor visibilityMode: ClipRendererVisibility;
    @expose("model") public accessor renderOnCanvas: boolean;

    @expose("view", false) public accessor canvas: HTMLCanvasElement;

    public initialize(): void {
        this.onAttach.add(() => {
            this.view?.resize();
            this.canvasController?.refreshCanvas();
        });
        super.initialize();
    }

    @auto() public set card(value: Card) {
        this.model.cardData = value.data as any;
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
        // TODO domToImage.toCanvas(this).then(function (canvas) {
        //     document.body.addChild()
        // });

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

export function clipRenderer(properties: RendererProperties<ClipRendererView, ClipRendererModel> = {}): ClipRenderer {
    turbo(properties).applyDefaults({
        tag: "vc-clip-renderer",
        view: ClipRendererView,
        model: ClipRendererModel,
        controllers: [ClipRendererFrameController, ClipRendererVisibilityController, ClipRendererVideoController]
    });
    return renderer({...properties}) as ClipRenderer;
}