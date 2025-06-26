import {Side, TurboDrawer} from "turbodombuilder";
import {TimelineView} from "../timeline.view";
import {ClipTimeline} from "./clipTimeline";
import {ClipScrubber} from "../../scrubber/clipScrubber/clipScrubber";

export class ClipTimelineView extends TimelineView<ClipTimeline> {
    public drawer: TurboDrawer;

    protected setupUIElements() {
        super.setupUIElements();

        this.drawer = new TurboDrawer({icon: "chevron", side: Side.right});
        this.scrubber = new ClipScrubber({timeline: this.element, director: this.element.director, initialize: true});
    }

    protected setupUILayout() {
        this.element.addChild(this.drawer);
        this.element.childHandler = this.drawer.childHandler;
        super.setupUILayout();
    }
}