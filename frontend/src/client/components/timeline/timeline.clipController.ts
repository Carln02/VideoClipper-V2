import "./timeline.css";
import {ClipRendererVisibility} from "../clipRenderer/clipRenderer.types";
import {TimelineIndexInfo} from "./timeline.types";
import {Timeline} from "./timeline";
import {effect, TurboController, TurboEvent} from "turbodombuilder";
import {TimelineView} from "./timeline.view";
import {TimelineModel} from "./timeline.model";
import {ToolType} from "../../directors/project/project.types";

export class TimelineClipController extends TurboController<Timeline, TimelineView, TimelineModel> {
    protected setupChangedCallbacks() {
        super.setupChangedCallbacks();

        const snapWhenShooting = (e: TurboEvent) => requestAnimationFrame(() => {
            if (e.toolName == ToolType.shoot) this.snapToClosest();
        });

        this.view.scrubber.onScrubbingEnd = snapWhenShooting;
        this.emitter.add("containerClicked", (e: TurboEvent) => snapWhenShooting(e));
    }

    public reloadCurrentClip() {
        this.model.indexInfo = this.view.getClipIndexAtTimestamp();
        if (!this.model.indexInfo || !this.view.currentClip) return; //TODO

        if (this.view.currentClip?.selected) this.element.director.contextManager.setContext(this.view.currentClip, 2, true);

        if (!this.element.isPlaying)
            this.element.renderer.setFrame(this.element.renderer.visibilityMode == ClipRendererVisibility.ghosting
            ? this.view.currentGhostingClip : this.view.currentClip, this.model.indexInfo?.offset);

        this.emitter.fire("clipReloaded");
    }

    public snapToClosest(entry: number | TimelineIndexInfo = this.model.indexInfo) {
        let index = typeof entry == "number" ? entry : entry.closestIntersection;
        if (index > this.model.totalClipsCount) index = this.model.totalClipsCount;

        let currentTime = 0;
        for (let i = 0; i < index; i++) currentTime += this.getDuration(i);
        this.model.currentTime = currentTime;
    }

    public snapAtEnd() {
        this.snapToClosest(this.element.dataSize);
    }

    private getDuration(index: number) {
        return this.view.getClipAt(index)?.duration || 0;
    }

    @effect private currentTimeChanged() {
        this.reloadCurrentClip();
    }
}
