import {Timeline} from "./timeline";
import {TimelineModel} from "./timeline.model";
import {PanelThumbProperties} from "../basicComponents/panelThumb/panelThumb.types";
import {DefaultEventName, div, flexRowCenter, icon, p, spacer, TurboEvent, TurboIcon, TurboView} from "turbodombuilder";
import {Scrubber} from "./components/scrubber/scrubber";
import {PanelThumb} from "../basicComponents/panelThumb/panelThumb";
import {ToolManager} from "../../managers/toolManager/toolManager";
import {ToolType} from "../../managers/toolManager/toolManager.types";
import {Clip} from "../clip/clip";
import {ClipRenderer} from "../clipRenderer/clipRenderer";
import {Card} from "../card/card";
import {ClipTimelineEntry} from "./timeline.types";
import {formatMMSS} from "../../../utils/time";

export class TimelineView extends TurboView<Timeline, TimelineModel> {
    public readonly clips: Clip[] = [];

    public readonly renderer: ClipRenderer;

    private playTimer: NodeJS.Timeout | null = null;
    private nextTimer: NodeJS.Timeout | null = null;

    public clipsContainer: HTMLDivElement;
    public scrubber: Scrubber;

    private currentTimeText: HTMLParagraphElement;
    private totalDurationText: HTMLParagraphElement;
    private playButton: TurboIcon;

    protected setupUIElements() {
        super.setupUIElements();

        this.clipsContainer = div({classes: "clips-container"});
        this.scrubber = new Scrubber(this.element, {parent: this.clipsContainer});

        this.currentTimeText = p({style: "min-width: 3em"});
        this.totalDurationText = p({style: "min-width: 3em; text-align: right"});

        this.playButton = icon({
            icon: "play",
            classes: "play-button",
            listeners: {
                [DefaultEventName.click]: (e: TurboEvent) => {
                    e.stopImmediatePropagation();
                    // this.play();
                }
            }
        });
    }

    protected setupUILayout() {
        super.setupUILayout();

        this.element.addChild([
            this.clipsContainer,
            this.scrubber,
            flexRowCenter({
                children: [
                    this.currentTimeText,
                    spacer(),
                    this.playButton,
                    spacer(),
                    this.totalDurationText
                ]
            })
        ]);
    }

    protected setupUIListeners() {
        super.setupUIListeners();

        this.clipsContainer.addEventListener(DefaultEventName.click, (e: TurboEvent) => {
            // this.currentTime = this.getTimeFromPosition(e);
            // if (ToolManager.instance.getFiredTool(e).name == ToolType.shoot) this.snapToClosest();
            // this.reloadCurrentClip();
        });
    }

    protected setupChangedCallbacks() {
        super.setupChangedCallbacks();
    }

    public updateCurrentTime(value: number) {
        this.currentTimeText.textContent = formatMMSS(value);
    }

    public updateTotalDuration(value: number) {
        this.totalDurationText.textContent = formatMMSS(value);
    }

    public updatePlayButtonIcon(isPlaying: boolean) {
        this.playButton.icon = isPlaying ? "pause" : "play";
    }
}