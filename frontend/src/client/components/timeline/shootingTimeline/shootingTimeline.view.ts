import {Direction, drawer, Side, turbo, TurboDrawer} from "turbodombuilder";
import {ShootingTimeline} from "./shootingTimeline";
import {TurboIcon} from "turbodombuilder";
import {clipScrubber} from "../../scrubber/clipScrubber/clipScrubber";
import {TimelineView} from "../timeline.view";

export class ShootingTimelineView extends TimelineView<ShootingTimeline> {
    public drawer: TurboDrawer;

    protected playButton: TurboIcon;

    protected setupUIElements() {
        super.setupUIElements();
        this.drawer = drawer({icon: "chevron", side: Side.right, ...(this.element.drawerProperties ?? {})});
        this.scrubber = clipScrubber({timeline: this.element, director: this.element.director, orientation: Direction.horizontal});
    }

    protected setupUILayout() {
        turbo(this).addChild(this.drawer).childHandler = turbo(this.drawer).childHandler;
        super.setupUILayout();
        this.totalDurationText.remove();
        turbo(this.drawer).addChild(this.currentTimeText, 0);
    }
}