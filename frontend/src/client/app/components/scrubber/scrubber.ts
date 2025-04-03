import {
    auto,
    define,
    div,
    icon, TurboDragEvent,
    TurboEvent,
    TurboEventName,
    TurboIcon, TurboMarkingMenu, TurboSelectEntry
} from "turbodombuilder";
import "./scrubber.css";
import {ScrubberMenu, ScrubberProperties} from "./scrubber.types";
import {Clip} from "../clip/clip";
import {Timeline} from "../timeline/timeline";
import {ClipTimelineEntry} from "../timeline/timeline.types";
import {VcComponent} from "../component/component";
import {DocumentManager} from "../../managers/documentManager/documentManager";

@define("vc-scrubber")
export class Scrubber extends VcComponent<any, any, any, DocumentManager> {
    private static markingMenu: TurboMarkingMenu;

    public screenManager: DocumentManager;

    private readonly head: TurboIcon;
    private readonly markingMenuHandle: HTMLDivElement;

    //The timeline it is attached to
    private readonly timeline: Timeline;

    //Whether it is currently scrubbing (fired by the user's action)
    private scrubbing: boolean = false;

    public onScrubbingStart: (e: TurboDragEvent) => void;
    public onScrubbing: (e: TurboDragEvent) => void;
    public onScrubbingEnd: (e: TurboDragEvent) => void;

    public constructor(properties: ScrubberProperties = {}) {
        super(properties);
        if (!Scrubber.markingMenu) this.createMarkingMenu();
        this.timeline = properties.timeline;
        this.head = icon({parent: this, icon: "scrubber-head", directory: "assets/misc"});
        this.markingMenuHandle = div({parent: this});

        this.initEvents();
    }

    private get clipEntry(): ClipTimelineEntry {
        return this.timeline.currentClipInfo;
    }

    private get clip(): Clip {
        return this.timeline.currentClip;
    }

    private createMarkingMenu() {
        const split = new TurboSelectEntry({
            value: ScrubberMenu.split, text: "Split",
            action: () => {}
        });

        const mute = new TurboSelectEntry({
            value: ScrubberMenu.mute, text: "Mute",
            action: () => this.clip.data.muted = !this.clip.data.muted
        });

        const insertCard = new TurboSelectEntry({
            value: ScrubberMenu.insertCard, text: "Insert Card",
            action: () => {}
        });

        const trimRight = new TurboSelectEntry({
            value: ScrubberMenu.trimRight, text: "Trim Right",
            action: () => this.clip.endTime -= this.clip.duration - this.clipEntry.offset
        });

        const deleteRight = new TurboSelectEntry({
            value: ScrubberMenu.deleteRight, text: "Delete Right",
            action: () => this.timeline.removeClipAt(this.clipEntry.index + 1)
        });

        const deleteEntry = new TurboSelectEntry({
            value: ScrubberMenu.delete, text: "Delete",
            action: () => this.timeline.removeClipAt(this.clipEntry.index)
        });

        const trimLeft = new TurboSelectEntry({
             value: ScrubberMenu.trimLeft, text: "Trim Left",
            action: () => this.clip.startTime += this.clipEntry.offset
        });

        const deleteLeft = new TurboSelectEntry({
            value: ScrubberMenu.deleteLeft, text: "Delete Left",
            action: () => this.timeline.removeClipAt(this.clipEntry.index - 1)
        });

        const reshoot = new TurboSelectEntry({
            value: ScrubberMenu.reshoot, text: "Reshoot",
            action: () => {}
        });

        const hide = new TurboSelectEntry({
            value: ScrubberMenu.hide, text: "Hide",
            action: () => this.clip.hidden = !this.clip.hidden
        });

        Scrubber.markingMenu = new TurboMarkingMenu({
            startAngle: -Math.PI * 0.8,
            endAngle: Math.PI * 0.8,
            semiMajor: 40,
            semiMinor: 40,
            values: [split, mute, insertCard, trimRight, deleteRight, deleteEntry, trimLeft, deleteLeft, reshoot, hide],
            onSelect: () => Scrubber.markingMenu.show(false)
        });
        this.screenManager.canvas.content.addChild(Scrubber.markingMenu);
    }

    private initEvents() {
        //Drag start --> start scrubbing and stop propagation
        this.head.addEventListener(TurboEventName.dragStart, (e: TurboDragEvent) => {
            this.scrubbing = true;
            if (this.onScrubbingStart) this.onScrubbingStart(e);
        });

        //On drag and if scrubbing --> stop propagation and move scrubber by delta position
        document.addEventListener(TurboEventName.drag, (e: TurboDragEvent) => {
            if (!this.scrubbing) return;
            e.stopImmediatePropagation();
            if (this.onScrubbing) this.onScrubbing(e);
        });

        //Drag end and if scrubbing --> end scrubbing and stop propagation
        document.addEventListener(TurboEventName.dragEnd, (e: TurboDragEvent) => {
            if (!this.scrubbing) return;
            this.scrubbing = false;
            if (this.onScrubbingEnd) this.onScrubbingEnd(e);
        });

        Scrubber.markingMenu.attachTo(this.markingMenuHandle, (e: TurboEvent) => {
            this.initMarkingMenu();
            Scrubber.markingMenu.show(true, e.scaledPosition);
        }, (e: TurboDragEvent) => {
            this.initMarkingMenu();
            Scrubber.markingMenu.show(undefined, e.scaledOrigins.first);
        });
    }

    /**
     * @description Translation value of the scrubber, in relation to the timeline container's dimensions.
     */
    @auto()
    public set translation(value: number) {
        this.style.transform = `translate(calc(${value / this.screenManager.canvas.scale}px - 50%), 0)`;
    }

    private initMarkingMenu() {
        const isBetweenClips = this.isBetweenClips;
        Scrubber.markingMenu.enable(isBetweenClips, ScrubberMenu.deleteLeft, ScrubberMenu.deleteRight);
        Scrubber.markingMenu.enable(!isBetweenClips, ScrubberMenu.trimLeft, ScrubberMenu.trimRight,
            ScrubberMenu.split, ScrubberMenu.mute, ScrubberMenu.hide, ScrubberMenu.reshoot);

        if (!isBetweenClips) {
            // Scrubber.markingMenu.find(ScrubberMenu.mute).buttonText = this.timeline.currentClip.clip.muted ? "Unmute" : "Mute";
            // Scrubber.markingMenu.find(ScrubberMenu.hide).buttonText = this.timeline.currentClip.clip.hidden ? "Show" : "Hide";
        }

        Scrubber.markingMenu.startAngle = isBetweenClips ? Math.PI * 0.5 : 0;
        Scrubber.markingMenu.endAngle = isBetweenClips ? Math.PI * 1.5 : Math.PI * 2;
    }

    private get isBetweenClips(): boolean {
        return false; //TODO
    }
}
