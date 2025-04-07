import {Timeline} from "./timeline";
import {TurboController, TurboDragEvent, TurboEvent} from "turbodombuilder";
import {TimelineView} from "./timeline.view";
import {TimelineModel} from "./timeline.model";

export class TimelineTimeController extends TurboController<Timeline, TimelineView, TimelineModel> {
    protected setupChangedCallbacks() {
        super.setupChangedCallbacks();

        this.emitter.add("totalDurationChanged", () => {
            this.element.card.duration = this.model.totalDuration;
        });

        this.emitter.add("containerClicked", (e: TurboEvent) => {
            this.model.currentTime = this.getTimeFromPosition(e);
        });

        this.view.scrubber.onScrubbing = (e: TurboDragEvent) => this.increaseTimeByDistance(e.deltaPosition.x);
    }

    public reloadTime() {
        this.model.totalDuration = this.element.clips.reduce((sum, clip) => sum + clip.duration, 0);
        this.model.currentTime = (this.view.scrubber.translation / this.element.width * this.model.totalDuration) || 0;
        this.element.refresh();
    }

    public getTimeFromPosition(e: TurboEvent): number {
        let offsetPosition = e.position.x - this.view.clipsContainer.getBoundingClientRect().left;
        if (offsetPosition < 0) offsetPosition = 0;
        if (offsetPosition > this.element.width) offsetPosition = this.element.width;
        return offsetPosition / this.element.width * this.model.totalDuration;
    }

    public increaseTimeByDistance(distance: number) {
        this.model.currentTime += distance / this.element.width * this.model.totalDuration;
    }
}