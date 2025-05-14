import {auto, define} from "turbodombuilder";
import {ClipRenderer} from "../../clipRenderer/clipRenderer";
import {Clip} from "../../clip/clip";
import "./clipTimeline.css";
import {DocumentManager} from "../../../managers/documentManager/documentManager";
import {Timeline} from "../timeline";
import {ClipView} from "../../clip/clip.view";
import {SyncedClip} from "../../clip/clip.types";
import {ClipTimelineView} from "./clipTimeline.view";
import {ClipTimelineProperties} from "./clipTimeline.types";

@define("vc-clip-timeline")
export class ClipTimeline extends Timeline<ClipTimelineView> {
    public screenManager: DocumentManager;
    public readonly renderer: ClipRenderer;

    public constructor(properties: ClipTimelineProperties) {
        super({...properties, viewConstructor: ClipTimelineView});
        this.addClass("vc-clip-timeline");
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
        return this.model.totalDuration * this.pixelsPerSecondUnit * ((this.scaled ? this.screenManager.canvas.scale : 1) || 1);
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