import {ClosestOrigin, turbo, TurboController, TurboDragEvent, YMap} from "turbodombuilder";
import {Selection} from "./selection";
import {SelectionModel} from "./selection.model";
import {Clip} from "../../components/clip/clip";
import {ClipTimeline} from "../../components/timeline/clipTimeline/clipTimeline";
import {SelectionView} from "./selection.view";

export class SelectionClipController extends TurboController<Selection, SelectionView, SelectionModel> {
    protected setupChangedCallbacks() {
        super.setupChangedCallbacks();
        this.emitter.add("updateIndicator", (e: TurboDragEvent) => this.insertIndicatorAfterClosestClip(e));
        this.emitter.add("moveClip", (e: TurboDragEvent) => this.moveClip(e));
    }

    public insertIndicatorAfterClosestClip(e: TurboDragEvent) {
        const timeline = this.getClosestTimeline(e);
        if (!timeline) return this.removeTimelineIndicator();

        this.model.timelineIndicatorIndex = timeline.getClipFromPosition(e).closestIntersection;

        if (timeline.clips[this.model.timelineIndicatorIndex] == this.view.clipClone.originElement
            || timeline.clips[this.model.timelineIndicatorIndex - 1] == this.view.clipClone.originElement) {
            this.removeTimelineIndicator();
            return;
        }

        timeline.addIndicatorAt(this.view.timelineIndicator, this.model.timelineIndicatorIndex + 1);
    }

    public moveClip(e: TurboDragEvent) {
        const timeline = this.getClosestTimeline(e);
        if (timeline && this.model.timelineIndicatorIndex != -1) {
            this.element.contextManager.clearContext();

            if (timeline.card == this.view.clipClone.originElement.card
                && this.model.timelineIndicatorIndex >= this.view.clipClone.originElement.dataIndex)
                this.model.timelineIndicatorIndex--;

            const clipDataCopy = (this.view.clipClone.originElement.data as YMap).toJSON();
            this.view.clipClone.originElement.card.removeClip(this.view.clipClone.originElement);
            const index = timeline.card.addClip(Clip.createData(clipDataCopy), this.model.timelineIndicatorIndex)
                this.element.contextManager.setContext(timeline.card, 1);
                this.element.contextManager.setContext(timeline.card.timeline.clips[index], 2, true);

        }

        this.cancelClipMoving();
    }

    protected removeTimelineIndicator() {
        this.view.timelineIndicator.remove();
        this.model.timelineIndicatorIndex = -1;
    }

    protected cancelClipMoving() {
        turbo(this.view.clipClone.originElement).setStyle("opacity", "1");
        this.removeTimelineIndicator();
        this.view.clipClone.remove();
        this.view.clipClone = null;
    }

    protected getClosestTimeline(e: TurboDragEvent) {
        const timeline = e.closest(ClipTimeline, false, ClosestOrigin.position);
        if (!timeline) return undefined;
        return e.closest(ClipTimeline, timeline.clipsContainer, ClosestOrigin.position);
    }
}