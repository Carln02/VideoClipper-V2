import {Timeline} from "./timeline";
import {TurboController, TurboEvent} from "turbodombuilder";
import {TimelineView} from "./timeline.view";
import {TimelineModel} from "./timeline.model";

export class TimelineTimeController extends TurboController<Timeline, TimelineView, TimelineModel> {
    protected setupChangedCallbacks() {
        super.setupChangedCallbacks();

        this.emitter.add("containerClicked", (e: TurboEvent) => {
            this.model.currentTime = this.getTimeFromPosition(e);
        });
    }

    public reloadTime() {
        this.model.currentTime = (this.view.scrubber.translation / this.element.width * this.model.totalDuration) || 0;
    }

    public getTimeFromPosition(e: TurboEvent): number {
        if( this.model.orientation === "horizontal" ) {
            let offsetPosition = e.position.x - this.view.scrubberContainer.getBoundingClientRect().left;
            if (offsetPosition < 0) offsetPosition = 0;
            if (offsetPosition > this.element.width) offsetPosition = this.element.width;
            return offsetPosition / this.element.width * this.model.totalDuration;
        } else {
            let offsetPosition = e.position.y - this.view.scrubberContainer.getBoundingClientRect().top;
            if (offsetPosition < 0) offsetPosition = 0;
            if (offsetPosition > this.element.height) offsetPosition = this.element.height;
            return offsetPosition / this.element.height * this.model.totalDuration;
        }
    }
}