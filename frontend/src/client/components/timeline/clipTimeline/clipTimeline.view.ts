import {drawer, Side, turbo, TurboDrawer} from "turbodombuilder";
import {TimelineView} from "../timeline.view";
import {ClipTimeline} from "./clipTimeline";
import {clipScrubber} from "../../scrubber/clipScrubber/clipScrubber";

export class ClipTimelineView extends TimelineView<ClipTimeline> {
    public drawer: TurboDrawer;

    protected setupUIElements() {
        super.setupUIElements();
        this.drawer = drawer({icon: "chevron", side: Side.right, ...(this.element.drawerProperties ?? {})});
        this.scrubber = clipScrubber({timeline: this.element, director: this.element.director});
    }

    protected setupUILayout() {
        turbo(this).addChild(this.drawer).childHandler = turbo(this.drawer).childHandler;
        super.setupUILayout();

        //TODO TOGGLE
        // this.totalDurationText.remove();
        // turbo(this.drawer).addChild(this.currentTimeText, 0);
    }
}