import "./timeline.css";
import {ClipRendererVisibility} from "../clipRenderer/clipRenderer.types";
import {ClipTimelineEntry} from "./timeline.types";
import {Timeline} from "./timeline";
import {TurboController, TurboEvent} from "turbodombuilder";
import {TimelineView} from "./timeline.view";
import {TimelineModel} from "./timeline.model";
import {ToolType} from "../../managers/toolManager/toolManager.types";
import {TimelineClipHandler} from "./timeline.clipHandler";

export class TimelineClipController extends TurboController<Timeline, TimelineView, TimelineModel> {
    protected setupChangedCallbacks() {
        super.setupChangedCallbacks();

        this.emitter.add("currentTimeChanged", () => this.reloadCurrentClip());

        const snapWhenShooting = (e: TurboEvent) => requestAnimationFrame(() => {
            if (this.element.screenManager.toolManager.getFiredTool(e).name == ToolType.shoot) this.snapToClosest();
        });

        this.view.scrubber.onScrubbingEnd = snapWhenShooting;
        this.emitter.add("containerClicked", (e: TurboEvent) => snapWhenShooting(e));
    }

    protected get clipHandler(): TimelineClipHandler {
        return this.model.clipHandler;
    }

    public reloadCurrentClip() {
        this.model.currentClipInfo = this.getClipAtTimestamp();
        // this.element.playController.play(false);
        this.element.screenManager.contextManager.setContext(this.model.currentClip, 2);
        if (this.element.renderer.isPlaying) return;

        if (!this.element.renderer || this.element.renderer.visibilityMode == ClipRendererVisibility.ghosting) return;
        this.element.renderer.setFrame(this.model.currentClip, this.model.currentClipInfo?.offset);
    }

    public snapToClosest(entry: number | ClipTimelineEntry = this.model.currentClipInfo) {
        let index = typeof entry == "number" ? entry : entry.closestIntersection;
        if (index > this.element.data.length) index = this.element.dataSize;

        let currentTime = 0;
        for (let i = 0; i < index; i++) currentTime += this.getDuration(i);
        this.model.currentTime = currentTime;

        this.element.renderer.setFrame(this.clipHandler.getClipAt(index <= 0 ? index : (index - 1)));
    }

    public snapAtEnd() {
        this.snapToClosest(this.element.dataSize);
    }

    public getClipAtTimestamp(time: number = this.model.currentTime): ClipTimelineEntry {
        if (!this.element.dataSize) return;
        let index = 0, accumulatedTime = 0;

        while (index < this.element.dataSize && accumulatedTime + this.getDuration(index) < time) {
            accumulatedTime += this.getDuration(index);
            index++;
        }

        if (index == this.element.dataSize) {
            index = this.element.dataSize - 1;
            accumulatedTime -= this.getDuration(index);
        }

        const clip = this.clipHandler.getClipAt(index);
        const offset = time - accumulatedTime;
        const closestIntersection = accumulatedTime < clip.duration / 2 ? index : (index + 1);

        return {
            clip: clip, offset: offset, index: index, closestIntersection: closestIntersection,
            distanceFromClosestIntersection: closestIntersection == index ? offset : clip.duration - offset
        };
    }

    private getDuration(index: number) {
        return this.clipHandler.getClipAt(index)?.duration || 0;
    }
}
