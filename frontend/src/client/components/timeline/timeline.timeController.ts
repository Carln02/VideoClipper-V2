import {Timeline} from "./timeline";
import {TurboController, TurboDragEvent, TurboEvent} from "turbodombuilder";
import {TimelineView} from "./timeline.view";
import {TimelineModel} from "./timeline.model";

export class TimelineTimeController extends TurboController<Timeline, TimelineView, TimelineModel> {
    protected setupChangedCallbacks() {
        super.setupChangedCallbacks();

        this.emitter.add("totalDurationChanged", () => {
            if (this.element.card) this.element.card.duration = this.model.totalDuration;
        });

        this.view.scrubber.onScrubbing = (e: TurboDragEvent) => this.emitter.fire("containerClicked", e);
        this.emitter.add("containerClicked", (e: TurboEvent) => {
            this.model.currentTime = this.getTimeFromPosition(e);
        });
    }

    public reloadTime() {
        this.model.currentTime = (this.view.scrubber.translation / this.element.width * this.model.totalDuration) || 0;
    }

    public getTimeFromPosition(e: TurboEvent): number {
        let offsetPosition = e.position.x - this.view.scrubberContainer.getBoundingClientRect().left;
        if (offsetPosition < 0) offsetPosition = 0;
        if (offsetPosition > this.element.width) offsetPosition = this.element.width;
        return offsetPosition / this.element.width * this.model.totalDuration;
    }
}