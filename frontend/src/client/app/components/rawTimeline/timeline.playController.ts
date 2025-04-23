import {RawTimeline} from "./rawTimeline";
import {TimelineView} from "./timeline.view";
import {TurboController} from "turbodombuilder";
import {TimelineModel} from "./timeline.model";
import {TimelineClipHandler} from "./timeline.clipHandler";
import {ClipRenderer} from "../clipRenderer/clipRenderer";

export class TimelinePlayController extends TurboController<RawTimeline, TimelineView, TimelineModel> {
    protected setupChangedCallbacks() {
        super.setupChangedCallbacks();

        this.emitter.add("playButtonClicked", () => this.play());
        this.emitter.add("containerClicked", () => {
            if (this.element.isPlaying) this.play(true);
        });
    }

    protected get renderer(): ClipRenderer {
        return this.element.renderer;
    }

    protected get clipHandler(): TimelineClipHandler {
        return this.model.clipHandler;
    }

    private initializePlayTimer(): void {
        this.model.playTimer = setInterval(() => {
            this.model.timeHandler.incrementTime();
            if (this.model.timeHandler.isCurrentTimeOutsideBounds()) {
                this.model.timeHandler.resetTimeIfOutsideBounds();
                clearInterval(this.model.playTimer);
            }
        }, this.model.timeIncrementMs);
    }

    private async playRecur(index: number, offset = 0) {
        if (index >= this.element.dataSize) return this.play(false);
        if (this.model.playTimer) clearInterval(this.model.playTimer);

        const curClip = this.clipHandler.getClipAt(index);
        const nextClip = this.clipHandler.getClipAt(index + 1);

        await this.renderer.setFrame(curClip, offset);
        await this.renderer.playNext();
        await this.renderer.loadNext(nextClip);
        this.initializePlayTimer();

        const timeoutDuration = 1000 * ((curClip?.duration || 0) - offset);
        this.model.nextTimer = setTimeout(() => this.playRecur(index + 1), timeoutDuration);
    }

    public async play(play: boolean = !this.renderer.isPlaying) {
        this.view.updatePlayButtonIcon(play);
        if (this.model.nextTimer) clearTimeout(this.model.nextTimer);
        if (this.model.playTimer) clearInterval(this.model.playTimer);

        if (!play) {
            this.renderer.pause();
            return;
        }

        this.model.timeHandler.resetTimeIfOutsideBounds();
        await this.renderer.loadNext(this.model.currentClip, this.model.currentClipInfo.offset);
        await this.playRecur(this.model.currentClipInfo.index, this.model.currentClipInfo.offset);
    }
}