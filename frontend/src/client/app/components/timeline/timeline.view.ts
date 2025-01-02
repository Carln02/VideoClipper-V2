import {YView} from "../../../../yManagement/yMvc/yView";
import {Timeline} from "./timeline";
import {TimelineModel} from "./timeline.model";
import {PanelThumbProperties} from "../basicComponents/panelThumb/panelThumb.types";
import {DefaultEventName, div, flexRowCenter, icon, p, spacer, TurboEvent, TurboIcon} from "turbodombuilder";
import {Scrubber} from "./components/scrubber/scrubber";
import {PanelThumb} from "../basicComponents/panelThumb/panelThumb";
import {ToolManager} from "../../managers/toolManager/toolManager";
import {ToolType} from "../../managers/toolManager/toolManager.types";
import {Clip} from "../clip/clip";
import {ClipRenderer} from "../clipRenderer/clipRenderer";
import {Card} from "../card/card";
import {ClipTimelineEntry} from "./timeline.types";

export class TimelineView extends YView<Timeline, TimelineModel> {
    public readonly clips: Clip[] = [];

    public readonly renderer: ClipRenderer;

    private playTimer: NodeJS.Timeout | null = null;
    private nextTimer: NodeJS.Timeout | null = null;

    private _card: Card;
    private _currentClip: ClipTimelineEntry;

    private thumb: PanelThumb;

    public clipsContainer: HTMLDivElement;
    private scrubber: Scrubber;

    private currentTimeText: HTMLParagraphElement;
    private totalDurationText: HTMLParagraphElement;
    private playButton: TurboIcon;

    protected setupChangedCallbacks() {
        super.setupChangedCallbacks();
    }

    protected setupUIElements() {
        super.setupUIElements();

        this.clipsContainer = div({classes: "clips-container"});
        this.scrubber = new Scrubber(this.element, {parent: this.clipsContainer});

    }

    private initUI(properties: PanelThumbProperties) {
        this.clipsContainer = div({classes: "clips-container", parent: this});
        this.scrubber = new Scrubber(this, {parent: this.clipsContainer});

        this.thumb = new PanelThumb({
            direction: properties.direction,
            fitSizeOf: properties.fitSizeOf,
            initiallyClosed: properties.initiallyClosed,
            closedOffset: properties.closedOffset,
            openOffset: properties.openOffset,
            invertOpenAndClosedValues: properties.invertOpenAndClosedValues,
            panel: this,
            parent: this
        });
        this.direction = properties.direction;

        this.currentTimeText = p({style: "min-width: 3em"});
        this.totalDurationText = p({style: "min-width: 3em; text-align: right"});

        this.playButton = icon({
            icon: "play",
            classes: "play-button",
            listeners: {
                [DefaultEventName.click]: (e: TurboEvent) => {
                    e.stopImmediatePropagation();
                    this.play();
                }
            }
        });

        this.addChild(flexRowCenter({
            children: [this.currentTimeText, spacer(), this.playButton, spacer(), this.totalDurationText]
        }));
    }

    private initEvents() {
        this.clipsContainer.addEventListener(DefaultEventName.click, (e: TurboEvent) => {
            this.currentTime = this.getTimeFromPosition(e);
            if (ToolManager.instance.getFiredTool(e).name == ToolType.shoot) this.snapToClosest();
            this.reloadCurrentClip();
        });
    }
}