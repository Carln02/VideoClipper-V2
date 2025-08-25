import {Direction, Side, TurboDrawer} from "turbodombuilder";
import {ShootingTimelineDrawer} from "../../shootingTimelineDrawer/shootingTimelineDrawer";
import {ShootingTimeline} from "./shootingTimeline";
import {TurboIcon} from "turbodombuilder";
import {ClipScrubber} from "../../scrubber/clipScrubber/clipScrubber";
import {TimelineView} from "../timeline.view";

export class ShootingTimelineView extends TimelineView<ShootingTimeline> {
    public drawer: ShootingTimelineDrawer;

    protected currentTimeText: HTMLParagraphElement;
    protected totalDurationText: HTMLParagraphElement;
    protected playButton: TurboIcon;

    protected setupUIElements() {
        super.setupUIElements();
        this.drawer = new TurboDrawer({icon: "chevron", side: Side.right});
        this.scrubber = new ClipScrubber({timeline: this.element, director: this.element.director, initialize: true},
            Direction.horizontal
        );
    }

    protected setupUILayout() {
        this.element.addChild(this.drawer);
        this.element.childHandler = this.drawer.childHandler;
        super.setupUILayout();
        this.totalDurationText.remove();
        this.drawer.addChild(this.currentTimeText, 0);
    }
}