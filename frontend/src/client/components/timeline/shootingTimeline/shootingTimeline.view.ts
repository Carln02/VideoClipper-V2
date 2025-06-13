import {Side, TurboDrawer} from "turbodombuilder";
import { ShootingTimelineDrawer } from "../../shootingTimelineDrawer/shootingTimelineDrawer";
import {TimelineView} from "../timeline.view";
import {ShootingTimeline} from "./shootingTimeline";
import {ClipScrubber} from "../../scrubber/clipScrubber/clipScrubber";

export class ShootingTimelineView extends TimelineView<ShootingTimeline> {
    public drawer: ShootingTimelineDrawer;

    protected setupUIElements() {
        super.setupUIElements();

        this.drawer = new ShootingTimelineDrawer({icon: "chevron", side: Side.right});
        this.scrubber = new ClipScrubber({timeline: this.element, director: this.element.director, initialize: true});
    }

    protected setupUILayout() {
        this.element.addChild(this.drawer);
        this.element.childHandler = this.drawer.childHandler;
        super.setupUILayout();
    }
}