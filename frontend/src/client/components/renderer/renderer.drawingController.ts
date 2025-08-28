import {Renderer} from "./renderer";
import {RendererView} from "./renderer.view";
import {TurboController} from "turbodombuilder";
import {RendererModel} from "./renderer.model";
import {RendererVideoController} from "./renderer.videoController";
import {urlToBlob} from "../../utils/conversion";

export class RendererDrawingController<
    ElementType extends Renderer = Renderer,
    ViewType extends RendererView = RendererView,
    ModelType extends RendererModel = RendererModel,
> extends TurboController<ElementType, ViewType, ModelType> {
    public async drawVideoFrame(video: HTMLVideoElement = this.view.video, animate = true): Promise<Blob> {
        if (animate) this.view.animateSnapshotEffect();

        return new Promise(resolve => {
            //If offscreen canvas supported
            if (window.OffscreenCanvas) {
                //Create one and get its context
                const offscreen = new OffscreenCanvas(video.videoWidth, video.videoHeight);
                const ctx = offscreen.getContext("2d");
                //Draw the frame
                ctx.drawImage(video, 0, 0, offscreen.width, offscreen.height);
                //Convert to blob
                resolve(offscreen.convertToBlob({type: "image/png"}));
            }
            //Fallback to actual canvas --> will cause a small lag
            else {
                //Draw frame
                this.drawFromImageSource(video).then(url => resolve(urlToBlob(url)));
            }
        });
    }

    public async drawFromImageSource(src: CanvasImageSource): Promise<string> {
        if (src instanceof HTMLVideoElement) await RendererVideoController.waitForVideoLoad(src);
        this.view.canvasContext.drawImage(src, 0, 0, this.view.width, this.view.height);
        return this.view.canvas.toDataURL("image/png");
    }
}