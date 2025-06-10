import {auto, define} from "turbodombuilder";
import {ClipRenderer} from "../../clipRenderer/clipRenderer";
import {Clip} from "../../clip/clip";
import "./shootingTimeline.css";
import {Timeline} from "../timeline";
import {ClipView} from "../../clip/clip.view";
import {SyncedClip} from "../../clip/clip.types";
import {ShootingTimelineView} from "./shootingTimeline.view";
import {ShootingTimelineProperties} from "./shootingTimeline.types";

@define("vc-shooting-timeline")
export class ShootingTimeline extends Timeline<ShootingTimelineView> {
    public readonly renderer: ClipRenderer;

    public constructor(properties: ShootingTimelineProperties) {
        super({...properties, viewConstructor: ShootingTimelineView});
        this.addClass("vc-shooting-timeline");
        this.scaled = true;
        if (properties.drawerProperties) this.view.drawer.setProperties(properties.drawerProperties);
    }

    protected onClipAdded(syncedClip: SyncedClip, id: number, blockKey: number): Clip {
        const clip = super.onClipAdded(syncedClip, id, blockKey, {viewConstructor: ClipView});
        this.view.scrubberContainer.addChild(clip, this.model.clipHandler.convertBlockScopeToIndex(id + 1, blockKey));
        return clip;
    }

    @auto()
    public set scaled(value: boolean) {
        if (this.view && this.view.scrubber) this.view.scrubber.scaled = value;
    }

    public get width() {
        return this.model.totalDuration * this.pixelsPerSecondUnit * ((this.scaled ? this.director.canvas.scale : 1) || 1);
    }

    public reloadTime() {
        super.reloadTime();
        this.view.drawer.refresh();
    }

    public addIndicatorAt(indicator: Element, index: number) {
        indicator.remove();
        this.view.scrubberContainer.addChild(indicator, index);
    }
}