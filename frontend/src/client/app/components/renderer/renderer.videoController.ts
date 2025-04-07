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
        this.video.play().then(() => this.model.isPlaying = true);
    }

    public pause() {
        if (!this.video.paused) this.video.pause();
        this.model.isPlaying = false;
    }

    public static waitForVideoLoad(video: HTMLVideoElement, seekTime: number = 0, delay: number = 300): Promise<void> {
        return new Promise((resolve, reject) => {
            const done = () => setTimeout(resolve, delay);

            const initialLoad = async () => {
                if (video.readyState >= 2) await handleSeek();
                else video.addEventListener("canplay", loadListener);
            };

            const loadListener = async () => {
                video.removeEventListener("canplay", loadListener);
                await handleSeek();
            };

            const handleSeek = async () => {
                video.currentTime = seekTime;
                if (video.readyState >= 3) done();
                else video.addEventListener("seeked", seekListener);
            };

            const seekListener = () => {
                video.removeEventListener("seeked", seekListener);
                done();
            };

            const onError = (err: unknown) => {
                video.removeEventListener("error", onError);
                reject(err);
            };

            video.addEventListener("error", onError);
            initialLoad();
        });
    }
}