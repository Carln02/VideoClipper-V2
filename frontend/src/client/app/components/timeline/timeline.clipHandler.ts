import "./timeline.css";
import {ClipRendererVisibility} from "../clipRenderer/clipRenderer.types";
import {ContextManager} from "../../managers/contextManager/contextManager";
import {ClipTimelineEntry} from "./timeline.types";
import {Timeline} from "./timeline";

export class TimelineClipHandler {
    private readonly element: Timeline;

    private _currentClip: ClipTimelineEntry;

    constructor(element: Timeline) {
        this.element = element;
    }

    public get currentClip() {
        return this._currentClip;
    }

    private set currentClip(value: ClipTimelineEntry) {
        this._currentClip = value;
    }

    public reFetchCurrentClip() {
        this.currentClip = this.getClipAtTimestamp();
    }

    public reloadCurrentClip(force: boolean = false) {
        this.element.play(false);
        ContextManager.instance.setContext(this.currentClip.clip, 2);
        if (!this.element.renderer || this.element.renderer.visibilityMode == ClipRendererVisibility.ghosting) return;
        this.element.renderer.setFrame(this.currentClip.clip, this.currentClip.offset, force);
    }

    public snapToClosest(entry: number | ClipTimelineEntry = this.currentClip) {
        let index = typeof entry == "number" ? entry : entry.closestIntersection;
        if (index > this.element.data.length) index = this.element.data.length;

        let currentTime = 0;
        for (let i = 0; i < index; i++) currentTime += this.getDuration(i);
        this.element.currentTime = currentTime;

        this.element.renderer.setFrame(this.element.getClipAtIndex(index <= 0 ? index : (index - 1)));
    }

    public getClipAtTimestamp(time: number = this.element.currentTime): ClipTimelineEntry {
        if (!this.element.data || !this.element.data.length) return;
        let index = 0, accumulatedTime = 0;

        while (index < this.element.data.length && accumulatedTime + this.getDuration(index) < time) {
            accumulatedTime += this.getDuration(index);
            index++;
        }

        if (index == this.element.data.length) {
            index = this.element.data.length - 1;
            accumulatedTime -= this.getDuration(index);
        }

        const clip = this.element.getClipAtIndex(index);
        const offset = time - accumulatedTime;
        const closestIntersection = accumulatedTime < clip.duration / 2 ? index : (index + 1);

        return {
            clip: clip, offset: offset, index: index, closestIntersection: closestIntersection,
            distanceFromClosestIntersection: closestIntersection == index ? offset : clip.duration - offset
        };
    }

    private getDuration(index: number) {
        return this.element.getClipAtIndex(index)?.duration || 0;
    }
}
