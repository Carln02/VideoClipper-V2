import {Side, TurboDrawer} from "turbodombuilder";
import { ShootingTimelineDrawer } from "../../shootingTimelineDrawer/shootingTimelineDrawer";
import {ShootingTimeline} from "./shootingTimeline";
import {
    auto,
    DefaultEventName,
    div,
    flexRowCenter,
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
        this.scrubber = new Scrubber({timeline: this.element, director: this.element.director, initialize: true});

        this.shootingTimelineContainer = flexRowCenter();
        this.currentTimeText = p({style: "min-width: 3em"});
        this.totalDurationText = p({style: "min-width: 3em; text-align: right"});

        this.playButton = icon({
            icon: "play",
            classes: "play-button",
        });

        this.drawer = new ShootingTimelineDrawer({icon: "chevron", side: Side.right});
        this.scrubber = new ClipScrubber({timeline: this.element, director: this.element.director, initialize: true});
    }

    protected setupUILayout() {

        this.scrubberContainer.addChild(this.scrubber, 0);
        //this.element.addChild([this.scrubberContainer, this.shootingTimelineContainer]);

        this.shootingTimelineContainer.addChild([
            this.playButton,
            spacer(),
            this.scrubberContainer,
            spacer(),
            this.currentTimeText
            //this.totalDurationText
        ]);

        this.element.addChild([this.drawer]);
        this.element.childHandler = this.drawer.childHandler;

        this.scrubberContainer.addChild(this.scrubber, 0);
        this.element.addChild([this.shootingTimelineContainer]);
    }
}