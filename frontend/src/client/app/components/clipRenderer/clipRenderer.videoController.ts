import {Clip} from "../clip/clip";
import {ClipRendererModel} from "./clipRenderer.model";
import {RendererVideoController} from "../renderer/renderer.videoController";
import {ClipRenderer} from "./clipRenderer";
import {ClipRendererView} from "./clipRenderer.view";

export class ClipRendererVideoController extends RendererVideoController<ClipRenderer, ClipRendererView, ClipRendererModel> {
    protected setupChangedCallbacks() {
        super.setupChangedCallbacks();
        this.emitter.add("canvasFillChanged", () => this.setVideoFrame(this.model.currentFrameOffset));
    }

    public loadNext(clip: Clip, offset: number = 0) {
        if (!clip || !clip.uri || !clip.metadata) return;


        this.videos[this.model.nextIndex].src = clip.uri;
        this.model.videoClips[this.model.nextIndex] = clip;
        this.videos[this.model.nextIndex].currentTime = offset;
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
        if (this.model.currentClip?.metadata?.type == "video") this.video.play();
    }

    public setVideoFrame(offsetTime: number = 0) {
        if (this.video.src != this.model.currentClip.uri) this.video.src = this.model.currentClip.uri;
        this.video.currentTime = offsetTime;
    }
}