import {Timeline} from "./timeline";
import {auto, trim, TurboEvent} from "turbodombuilder";
import {TimelineView} from "./timeline.view";

export class TimelineTimeHandler {
    private readonly element: Timeline;
    private readonly view: TimelineView;

    private _currentTime: number = 0;

    constructor(element: Timeline, view: TimelineView) {
        this.element = element;
        this.view = view;
    }

    public get currentTime(): number {
        return this._currentTime;
    }

    public set currentTime(value: number) {
        this._currentTime = trim(value, this.totalDuration);
        this.view.scrubber.translation = this._currentTime / this.totalDuration * this.element.width;
        this.element.reFetchCurrentClip();
        this.view.updateCurrentTime(this._currentTime);
    }

    @auto()
    public set totalDuration(value: number) {
        this.element.card.duration = value;
        this.view.updateTotalDuration(value);
    }

    public reloadTime() {
        this.totalDuration = this.element.clips.reduce((sum, clip) => sum + clip.duration, 0);
        this.currentTime = (this.view.scrubber.translation / this.element.width * this.totalDuration) || 0;
        this.element.refresh();
    }

    public getTimeFromPosition(e: TurboEvent): number {
        let offsetPosition = e.position.x - this.view.clipsContainer.getBoundingClientRect().left;
        if (offsetPosition < 0) offsetPosition = 0;
        if (offsetPosition > this.element.width) offsetPosition = this.element.width;
        return offsetPosition / this.element.width * this.totalDuration;
    }
}