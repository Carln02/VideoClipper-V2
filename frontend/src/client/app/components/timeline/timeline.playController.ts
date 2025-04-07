import {Timeline} from "./timeline";
import {TimelineView} from "./timeline.view";
import {TurboController} from "turbodombuilder";
import {TimelineModel} from "./timeline.model";
import {TimelineClipHandler} from "./timeline.clipHandler";
import {TimelineTimeHandler} from "./timeline.timeHandler";
import {ClipRenderer} from "../clipRenderer/clipRenderer";

export class TimelinePlayController extends TurboController<Timeline, TimelineView, TimelineModel> {
    protected setupChangedCallbacks() {
        super.setupChangedCallbacks();
        this.emitter.add("playButtonClicked", () => this.play());
    }

    protected get renderer(): ClipRenderer {
        return this.element.renderer;
    }

    protected get clipHandler(): TimelineClipHandler {
        return this.model.clipHandler;
    }

    protected get timeHandler(): TimelineTimeHandler {
        return this.model.timeHandler;
    }

    public isPlaying(): boolean {
        return this.model.playTimer != null;
    }

    private async playNext(index: number, offset = 0) {
        if (index >= this.element.dataSize) return this.play(false);

        await this.renderer.setFrame(this.clipHandler.getClipAt(index), offset);
        this.renderer.playNext();

        await this.renderer.loadNext(this.clipHandler.getClipAt(index + 1));

        this.model.nextTimer = setTimeout(() => this.playNext(index + 1),
            1000 * ((this.clipHandler.getClipAt(index)?.duration || 0) - offset)
        );
    }

    public async play(play: boolean = !this.isPlaying()) {
        this.view.updatePlayButtonIcon(play);
        if (this.model.nextTimer) clearTimeout(this.model.nextTimer);
        this.model.nextTimer = null;

        if (this.model.playTimer) clearInterval(this.model.playTimer);
        this.model.playTimer = null;

        if (!play) {
            this.renderer.pause();
            return;
        }

        this.timeHandler.resetTimeIfOutsideBounds();
        await this.renderer.loadNext(this.model.currentClip, this.model.currentClipInfo.offset);
        await this.playNext(this.model.currentClipInfo.index, this.model.currentClipInfo.offset);

        this.model.playTimer = setInterval(() => {
            this.timeHandler.incrementTime();
            if (this.timeHandler.isCurrentTimeOutsideBounds()) clearInterval(this.model.playTimer);
        }, this.model.timeIncrementMs);
    }
}