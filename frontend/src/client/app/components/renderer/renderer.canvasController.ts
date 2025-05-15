import {Renderer} from "./renderer";
import {RendererView} from "./renderer.view";
import {RendererModel} from "./renderer.model";
import {TurboController} from "turbodombuilder";
import {RendererVideoController} from "./renderer.videoController";

export class RendererCanvasController<
    ElementType extends Renderer = Renderer,
    ViewType extends RendererView = RendererView,
    ModelType extends RendererModel = RendererModel
> extends TurboController<ElementType, ViewType, ModelType> {
    protected setupChangedCallbacks() {
        super.setupChangedCallbacks();
        this.emitter.add("canvasFillChanged", () => this.refreshCanvas());
    }

    public async refreshCanvas() {
        const fill = this.model.currentCanvasFill;

        if (!fill) {
            this.view.canvasContext.clearRect(0, 0, this.view.width, this.view.height);
            return;
        }

        if (typeof fill == "string") {
            if (fill.length < 30) {
                // Assume it's a color string
                this.view.canvasContext.fillStyle = fill;
                this.view.canvasContext.fillRect(0, 0, this.view.width, this.view.height);
                return;
            } else {
                const img = new Image();
                await new Promise<void>((resolve, reject) => {
                    img.onload = () => {
                        this.view.canvasContext.drawImage(img, 0, 0, this.view.width, this.view.height);
                        resolve();
                    };
                    img.onerror = (err) => reject(err);
                    img.src = fill;
                }).catch(() => {
                    console.error("Failed to load image:", fill);
                    this.view.canvasContext.clearRect(0, 0, this.view.width, this.view.height);
                });
                return;
            }
        } else {
            if (fill instanceof HTMLVideoElement) await RendererVideoController.waitForVideoLoad(fill);
            this.view.canvasContext.drawImage(fill, 0, 0, this.view.width, this.view.height);
        }
    }
}