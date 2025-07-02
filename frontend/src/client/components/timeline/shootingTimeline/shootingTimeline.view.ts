import {Direction, Side, TurboDrawer} from "turbodombuilder";
import { ShootingTimelineDrawer } from "../../shootingTimelineDrawer/shootingTimelineDrawer";
import {ShootingTimeline} from "./shootingTimeline";
import {
    auto,
    DefaultEventName,
    div,
    flexColCenter,
    icon,
    p,
    spacer,
    TurboEvent,
    TurboIcon,
    TurboView
} from "turbodombuilder";
import {formatMMSS} from "../../../utils/time";
import {ClipScrubber} from "../../scrubber/clipScrubber/clipScrubber";
import {Scrubber} from "../../scrubber/scrubber";
import {TimelineView} from "../timeline.view";

export class ShootingTimelineView  extends TimelineView<ShootingTimeline> {
    
    public drawer: ShootingTimelineDrawer;
    private shootingTimelineContainer: HTMLElement;
    public scrubberContainer: HTMLDivElement;
    public scrubber: Scrubber;

    protected currentTimeText: HTMLParagraphElement;
    protected totalDurationText: HTMLParagraphElement;
    protected playButton: TurboIcon;

    protected setupUIElements() {
        super.setupUIElements();

        this.scrubberContainer = div({classes: "scrubber-container"});

        this.shootingTimelineContainer = flexColCenter({classes: "shooting-timeline-container"});
        this.currentTimeText = p({style: "min-width: 3em"});
        this.totalDurationText = p({style: "min-width: 3em; text-align: right"});

        this.playButton = icon({
            icon: "play",
            classes: "play-button",
        });

        this.drawer = new ShootingTimelineDrawer({icon: "chevron", side: Side.right});
        this.scrubber = new ClipScrubber({timeline: this.element, director: this.element.director, initialize: true},
                                          Direction.horizontal
        );
    }

    protected setupUILayout() {

        this.scrubberContainer.addChild(this.scrubber, 0);

        this.shootingTimelineContainer.addChild([
            this.currentTimeText,
            spacer(),
            this.scrubberContainer,
            spacer(),
            this.playButton
            //this.totalDurationText
        ]);

        this.element.addChild([this.drawer]);
        this.element.childHandler = this.drawer.childHandler;

        this.element.addChild([this.shootingTimelineContainer]);
    }
}