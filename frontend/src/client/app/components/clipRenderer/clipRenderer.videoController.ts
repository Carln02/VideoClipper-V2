import {Clip} from "../clip/clip";
import {ClipRendererModel} from "./clipRenderer.model";
import {RendererVideoController} from "../renderer/renderer.videoController";
import {ClipRenderer} from "./clipRenderer";
import {ClipRendererView} from "./clipRenderer.view";

export class ClipRendererVideoController extends RendererVideoController<ClipRenderer, ClipRendererView, ClipRendererModel> {
    protected setupChangedCallbacks() {
        super.setupChangedCallbacks();

        this.emitter.add("clipChanged", async (index: number) => {
            const clip = this.model.getClip(index);
            const offset = this.model.getOffset(index);
            const video = this.videos[index];
            if (!clip || !video) return;

            if (clip.uri) {
                video.src = clip.uri;
                await RendererVideoController.waitForVideoLoad(video, offset);
            } else {
                video.removeAttribute("src");
                video.load();
            }
        });
    }

    public async loadNext(clip: Clip, offset: number = 0) {
        if (!clip) return;
        this.model.setClipWithOffset(clip, offset, this.model.nextIndex);
    }

    public async playNext() {
        this.model.currentIndex++;
        const clip = this.model.getClip();
        if (!clip) return;

        if (clip.metadata?.type == "video") {
            this.view.showCurrentVideo();
            await this.play();
        } else this.model.isPlaying = true;
    }

    public async play() {
        if (this.model.getClip()?.metadata?.type == "video") await super.play();
    }
}