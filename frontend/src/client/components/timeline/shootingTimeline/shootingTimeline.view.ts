import {Side, TurboDrawer} from "turbodombuilder";
import { ShootingTimelineDrawer } from "../../shootingTimelineDrawer/shootingTimelineDrawer";
import {TimelineView} from "../timeline.view";
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
import { TimelineModel } from "../timeline.model";

export class ShootingTimelineView<
    Element extends ShootingTimeline = ShootingTimeline,
    Model extends TimelineModel = TimelineModel
> extends TurboView<Element, Model> {
    
    public drawer: ShootingTimelineDrawer;
    private shootingTimelineContainer: HTMLElement;
    public scrubberContainer: HTMLDivElement;
    public scrubber: Scrubber;

    private currentTimeText: HTMLParagraphElement;
    private totalDurationText: HTMLParagraphElement;
    private playButton: TurboIcon;

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

        this.element.addChild([this.drawer, this.shootingTimelineContainer]);
        this.element.childHandler = this.drawer.childHandler;
        super.setupUILayout();
    }
}