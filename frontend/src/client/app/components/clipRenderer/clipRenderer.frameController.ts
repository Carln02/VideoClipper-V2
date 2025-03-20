import {ClipRenderer} from "./clipRenderer";
import {ClipRendererView} from "./clipRenderer.view";
import {Clip} from "../clip/clip";
import {ClipRendererModel} from "./clipRenderer.model";
import {TurboController} from "turbodombuilder";

export class ClipRendererFrameController extends TurboController<ClipRenderer, ClipRendererView, ClipRendererModel> {
    public async setFrame(clip: Clip = this.model.currentClip, offsetTime: number = 0, force: boolean = false,
                          forceCanvas: boolean = false) {
        if (!clip) return;
        if (!force && Date.now() - this.model.lastFrameUpdate < this.model.frameUpdateFrequency) return;
        this.model.lastFrameUpdate = Date.now();

        if (clip != this.model.currentClip) {
            //TODO this.videoHandler.pause();
            this.model.currentClip = clip;
        }

        this.model.currentFrameOffset = offsetTime;
        this.model.currentClip = clip;

        await this.setCurrentClipBackground(clip, forceCanvas);
    }


    private async setCurrentClipBackground(clip: Clip, forceCanvas: boolean = false) {
        if (!clip) this.model.currentCanvasFill = null;
        else if (clip.backgroundFill) this.model.currentCanvasFill = clip.backgroundFill;
        else if (clip.mediaId) {
            if (this.model.currentClip.metadata?.type == "image") this.model.currentCanvasFill = this.model.currentClip.uri;
            else this.model.currentCanvasFill = forceCanvas ? this.view.video : null;
        }
    }
}