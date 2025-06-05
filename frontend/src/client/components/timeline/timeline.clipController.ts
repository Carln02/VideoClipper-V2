import "./timeline.css";
import {ClipRendererVisibility} from "../clipRenderer/clipRenderer.types";
import {TimelineIndexInfo} from "./timeline.types";
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
            if (this.element.director.toolManager.getFiredTool(e).name == ToolType.shoot) this.snapToClosest();
        });

        this.view.scrubber.onScrubbingEnd = snapWhenShooting;
        this.emitter.add("containerClicked", (e: TurboEvent) => snapWhenShooting(e));
    }

    protected get clipHandler(): TimelineClipHandler {
        return this.model.clipHandler;
    }

    public reloadCurrentClip() {
        this.model.indexInfo = this.clipHandler.getClipIndexAtTimestamp();
        this.element.director.contextManager.setContext(this.model.currentClip, 2);
        if (this.element.renderer.isPlaying) return;
        this.element.renderer.setFrame(this.element.renderer.visibilityMode == ClipRendererVisibility.ghosting
            ? this.model.currentGhostingClip : this.model.currentClip, this.model.indexInfo?.offset);
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
        return this.clipHandler.getClipAt(index)?.duration || 0;
    }
}
