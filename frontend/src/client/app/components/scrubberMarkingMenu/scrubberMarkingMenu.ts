import "./scrubberMarkingMenu.css";
import {define, Point, TurboMarkingMenu, TurboMarkingMenuProperties, TurboSelectEntry} from "turbodombuilder";
import {ScrubberMenu} from "./scrubberMarkingMenu.types";
import {Scrubber} from "../scrubber/scrubber";
import {Clip} from "../clip/clip";
import {TimelineIndexInfo} from "../timeline/timeline.types";
import {Timeline} from "../timeline/timeline";

@define()
export class ScrubberMarkingMenu extends TurboMarkingMenu {
    public scrubber: Scrubber;

    public constructor(properties: TurboMarkingMenuProperties) {
        if (!properties.semiMinor) properties.semiMinor = 40;
        if (!properties.semiMajor) properties.semiMajor = 40;
        super(properties);
        this.addClass("turbo-marking-menu");

        this.scrubber = properties.scrubber;
        this.onSelect = () => this.show(false);
        this.initializeEntries();
    }

    public get timeline(): Timeline {
        return this.scrubber.timeline;
    }

    public get clip(): Clip {
        return this.timeline.currentClip;
    }

    public get clipInfo(): TimelineIndexInfo {
        return this.timeline.currentClipInfo;
    }

    protected initializeEntries(): void {
        this.addEntry(new TurboSelectEntry({
            value: ScrubberMenu.split, text: "Split",
            action: () => this.timeline.splitClipAt()
        }));

        this.addEntry(new TurboSelectEntry({
            value: ScrubberMenu.mute, text: "Mute",
            action: () => this.clip.muted = !this.clip.muted
        }));

        this.addEntry(new TurboSelectEntry({
            value: ScrubberMenu.insertCard, text: "Insert Card",
            action: () => {}
        }));

        this.addEntry(new TurboSelectEntry({
            value: ScrubberMenu.trimRight, text: "Trim Right",
            action: () => this.clip.endTime -= this.clip.duration - this.clipInfo.offset
        }));

        this.addEntry(new TurboSelectEntry({
            value: ScrubberMenu.deleteRight, text: "Delete Right",
            action: () => this.timeline.removeClipAt(this.clipInfo.clipIndex + 1)
        }));

        this.addEntry(new TurboSelectEntry({
            value: ScrubberMenu.delete, text: "Delete",
            action: () => this.timeline.removeClipAt(this.clipInfo.clipIndex)
        }));

        this.addEntry(new TurboSelectEntry({
            value: ScrubberMenu.trimLeft, text: "Trim Left",
            action: () => this.clip.startTime += this.clipInfo.offset
        }));

        this.addEntry(new TurboSelectEntry({
            value: ScrubberMenu.deleteLeft, text: "Delete Left",
            action: () => this.timeline.removeClipAt(this.clipInfo.clipIndex - 1)
        }));

        this.addEntry(new TurboSelectEntry({
            value: ScrubberMenu.reshoot, text: "Reshoot",
            action: () => {}
        }));

        this.addEntry(new TurboSelectEntry({
            value: ScrubberMenu.hide, text: "Hide",
            action: () => this.clip.hidden = !this.clip.hidden
        }));
    }

    public show(b?: boolean, position?: Point): this {
        const isBetweenClips = this.clipInfo.distanceFromClosestIntersection < 0.2;
        const clipIndex = this.clipInfo.clipIndex;

        this.enable(isBetweenClips && clipIndex !== 0, ScrubberMenu.deleteRight);
        this.enable(isBetweenClips && clipIndex !== this.timeline.clips.length - 1, ScrubberMenu.deleteLeft);

        this.enable(!isBetweenClips, ScrubberMenu.trimLeft, ScrubberMenu.trimRight, ScrubberMenu.delete,
            ScrubberMenu.split, ScrubberMenu.mute, ScrubberMenu.hide, ScrubberMenu.reshoot);

        if (!isBetweenClips) {
            this.find(ScrubberMenu.mute).text = this.clip.muted ? "Unmute" : "Mute";
            this.find(ScrubberMenu.hide).text = this.clip.hidden ? "Show" : "Hide";
        }

        const isFullCircle = this.enabledEntries.length > 4;
        this.startAngle = isFullCircle ? 0 : -0.33 * Math.PI;
        this.endAngle = isFullCircle ? Math.PI * 2 : 0.33 * Math.PI;

        return super.show(b, position);
    }
}