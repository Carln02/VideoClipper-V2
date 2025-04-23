import {TurboHandler} from "turbodombuilder";
import {TimelineModel} from "./timeline.model";

export class TimelineTimeHandler extends TurboHandler<TimelineModel> {
    public isCurrentTimeOutsideBounds(): boolean {
        return this.model.currentTime < 0 || this.model.currentTime >= this.model.totalDuration - this.model.timeIncrementS * 3;
    }

    public resetTimeIfOutsideBounds() {
        if (this.isCurrentTimeOutsideBounds()) this.model.currentTime = 0;
    }

    public incrementTime() {
        this.model.currentTime += this.model.timeIncrementS;
    }
}