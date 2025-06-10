import {Side, TurboDrawer} from "turbodombuilder";
import {TimelineView} from "../timeline.view";
import {ShootingTimeline} from "./shootingTimeline";
import {ClipScrubber} from "../../scrubber/clipScrubber/clipScrubber";

export class ShootingTimelineView extends TimelineView<ShootingTimeline> {
    public drawer: TurboDrawer;

    protected setupUIElements() {
        super.setupUIElements();

        this.drawer = new TurboDrawer({icon: "chevron", side: Side.right});
        this.scrubber = new ClipScrubber({timeline: this.element, screenManager: this.element.screenManager, initialize: true});
    }

    protected setupUILayout() {
        this.element.addChild(this.drawer);
        this.element.childHandler = this.drawer.childHandler;
        super.setupUILayout();
    }
}