import {RendererModel} from "./renderer.model";
import {TurboController} from "turbodombuilder";
import {Renderer} from "./renderer";
import {RendererView} from "./renderer.view";

export class RendererVideoController<
    ElementType extends Renderer = Renderer,
    ViewType extends RendererView = RendererView,
    ModelType extends RendererModel = RendererModel,
> extends TurboController<ElementType, ViewType, ModelType> {
    protected get videos(): HTMLVideoElement[] {
        return this.view.videos;
    }

    protected get video(): HTMLVideoElement {
        return this.view.video;
    }

    public play() {
        this.video.play();
    }

    public pause() {
        if (!this.video.paused) this.video.pause();
    }

    public static waitForVideoLoad(video: HTMLVideoElement, delay: number = 300): Promise<void> {
        return new Promise((resolve, reject) => {
            if (video.readyState >= 2) {
                setTimeout(resolve, delay);
            } else {
                const onCanPlay = () => {
                    video.removeEventListener("canplay", onCanPlay);
                    video.removeEventListener("canplaythrough", onCanPlay);
                    setTimeout(resolve, delay);
                };

                const onError = (err: unknown) => {
                    video.removeEventListener("error", onError);
                    reject(err);
                };

                video.addEventListener("canplaythrough", onCanPlay);
                video.addEventListener("canplay", onCanPlay);
                video.addEventListener("error", onError);
            }
        });
    }
}