import {Renderer} from "./renderer";
import {RendererView} from "./renderer.view";
import {TurboController} from "turbodombuilder";
import {RendererModel} from "./renderer.model";
import {RendererVideoController} from "./renderer.videoController";

export class RendererDrawingController<
    ElementType extends Renderer = Renderer,
    ViewType extends RendererView = RendererView,
    ModelType extends RendererModel = RendererModel,
> extends TurboController<ElementType, ViewType, ModelType> {
    public async drawFromImageSource(src: CanvasImageSource): Promise<string> {
        if (src instanceof HTMLVideoElement) await RendererVideoController.waitForVideoLoad(src);
        this.view.canvasContext.drawImage(src, 0, 0, this.view.width, this.view.height);
        return this.view.canvas.toDataURL("image/png");
    }
}