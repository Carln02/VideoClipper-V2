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

    public async play() {
        await this.video.play();
        this.model.isPlaying = true;
    }

    public pause() {
        if (!this.video.paused) this.video.pause();
        this.model.isPlaying = false;
    }

    public static waitForVideoLoad(video: HTMLVideoElement, seekTime: number = 0, delay: number = 60): Promise<void> {
        return new Promise((resolve, reject) => {
            const done = () => setTimeout(resolve, delay);

            const initialLoad = () => {
                if (video.readyState >= 2) handleSeek();
                else video.addEventListener("canplay", loadListener);
            };

            const loadListener = () => {
                video.removeEventListener("canplay", loadListener);
                handleSeek();
            };

            const handleSeek = () => {
                video.addEventListener("seeked", seekListener);
                //TODO SEEK IS NOT WORKINGGGGGG
                setTimeout(() => video.currentTime = Math.round(seekTime * 100) / 100, delay);
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