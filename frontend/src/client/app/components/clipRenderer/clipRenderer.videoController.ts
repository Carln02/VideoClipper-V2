import {Clip} from "../clip/clip";
import {ClipRendererModel} from "./clipRenderer.model";
import {RendererVideoController} from "../renderer/renderer.videoController";
import {ClipRenderer} from "./clipRenderer";
import {ClipRendererView} from "./clipRenderer.view";

export class ClipRendererVideoController extends RendererVideoController<ClipRenderer, ClipRendererView, ClipRendererModel> {
    protected setupChangedCallbacks() {
        super.setupChangedCallbacks();

        this.emitter.add("frameChanged", async () => {
            if (this.model.isPlaying) return;
            const uri = this.model.currentClip.uri;
            if (!uri) return;

            if (this.video.src != uri) this.video.src = uri;
            await RendererVideoController.waitForVideoLoad(this.video, this.model.currentFrameOffset);
        });
    }

    public async loadNext(clip: Clip, offset: number = 0) {
        if (!clip || !clip.uri || !clip.metadata) return;

        this.videos[this.model.nextIndex].src = clip.uri;
        this.model.videoClips[this.model.nextIndex] = clip;
        await RendererVideoController.waitForVideoLoad(this.videos[this.model.nextIndex], offset);
    }

    public playNext() {
        if (this.model.videoClips[this.model.nextIndex]?.metadata?.type != "video") return;

        this.video.setStyle("display", "none");
        this.model.currentIndex++;
        this.play();

        requestAnimationFrame(() => {
            this.video.parentElement.addChildBefore(this.videos[this.model.previousIndex], this.video);
            this.videos[this.model.previousIndex].setStyle("display", "");
        });
    }

    public play() {
        if (this.model.currentClip?.metadata?.type == "video") super.play();
    }
}