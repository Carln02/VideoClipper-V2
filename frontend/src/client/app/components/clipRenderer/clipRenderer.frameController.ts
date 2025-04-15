import {ClipRenderer} from "./clipRenderer";
import {ClipRendererView} from "./clipRenderer.view";
import {Clip} from "../clip/clip";
import {ClipRendererModel} from "./clipRenderer.model";
import {TurboController} from "turbodombuilder";

export class ClipRendererFrameController extends TurboController<ClipRenderer, ClipRendererView, ClipRendererModel> {
    public async setFrame(clip: Clip = this.model.getClip(), offsetTime: number = 0, force: boolean = false,
                          forceCanvas: boolean = false) {
        if (!force && Date.now() - this.model.lastFrameUpdate < this.model.frameUpdateFrequency) return;
        this.model.lastFrameUpdate = Date.now();

        this.model.setClipWithOffset(clip, offsetTime);
        await this.setCurrentClipBackground(clip, forceCanvas);
    }


    private async setCurrentClipBackground(clip: Clip, forceCanvas: boolean = false) {
        if (!clip) this.model.currentCanvasFill = null;
        else if (clip.backgroundFill) this.model.currentCanvasFill = clip.backgroundFill;
        else if (clip.mediaId) {
            if (clip.metadata?.type == "image") this.model.currentCanvasFill = clip.uri;
            else this.model.currentCanvasFill = forceCanvas ? this.view.video : null;
        }
    }
}