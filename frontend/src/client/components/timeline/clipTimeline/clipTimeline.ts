import {define, turbo, TurboDrawerProperties} from "turbodombuilder";
import {ClipRenderer} from "../../clipRenderer/clipRenderer";
import {Clip} from "../../clip/clip";
import "./clipTimeline.css";
import {timeline, Timeline} from "../timeline";
import {ClipView} from "../../clip/clip.view";
import {SyncedClip} from "../../clip/clip.types";
import {ClipTimelineView} from "./clipTimeline.view";
import {ClipTimelineProperties} from "./clipTimeline.types";

@define("vc-clip-timeline")
export class ClipTimeline extends Timeline<ClipTimelineView> {
    public readonly renderer: ClipRenderer;
    public drawerProperties: TurboDrawerProperties;

    public initialize(): void {
        this.view.onClipAdded = (syncedClip, id, self, blockKey) =>
            this.onClipAdded(syncedClip, id, self, blockKey);
        super.initialize();

    }

    protected onClipAdded(syncedClip: SyncedClip, id: number, self, blockKey: number): Clip {
        const clip = super.onClipAdded(syncedClip, id, self, blockKey, {view: ClipView});
        turbo(this.view.scrubberContainer).addChild(clip, this.model.flattenKey(id + 1, blockKey));
        return clip;
    }

    public get width() {
        return this.model.totalDuration * this.pixelsPerSecondUnit * ((this.scaled ? this.director.canvas.scale : 1) || 1);
    }

    public reloadTime() {
        super.reloadTime();
        this.view.drawer.refresh();
    }

    public get clipsContainer(): HTMLDivElement {
        return this.view.scrubberContainer;
    }
}

export function clipTimeline(properties: ClipTimelineProperties): ClipTimeline {
    turbo(properties).applyDefaults({tag: "vc-clip-timeline", view: ClipTimelineView, scaled: true});
    return timeline({...properties}) as ClipTimeline;
}