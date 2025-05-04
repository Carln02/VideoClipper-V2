import {
    auto,
    define,
    div,
    icon, TurboDragEvent,
    TurboEvent,
    TurboEventName,
    TurboIcon
} from "turbodombuilder";
import "./scrubber.css";
import {ScrubberProperties} from "./scrubber.types";
import {Timeline} from "../timeline/timeline";
import {VcComponent} from "../component/component";
import {DocumentManager} from "../../managers/documentManager/documentManager";
import {ScrubberMarkingMenu} from "../scrubberMarkingMenu/scrubberMarkingMenu";

@define("vc-scrubber")
export class Scrubber extends VcComponent<any, any, any, DocumentManager> {
    private static markingMenu: ScrubberMarkingMenu;

    public screenManager: DocumentManager;

    private head: TurboIcon;
    private markingMenuHandle: HTMLDivElement;

    //The timeline it is attached to
    public readonly timeline: Timeline;

    //Whether it is currently scrubbing (fired by the user's action)
    private scrubbing: boolean = false;

    public onScrubbingStart: (e: TurboDragEvent) => void;
    public onScrubbing: (e: TurboDragEvent) => void;
    public onScrubbingEnd: (e: TurboDragEvent) => void;

    public constructor(properties: ScrubberProperties = {}) {
        super(properties);
        if (!Scrubber.markingMenu) {
            Scrubber.markingMenu = new ScrubberMarkingMenu({});
            this.screenManager.canvas.content.addChild(Scrubber.markingMenu);
        }
        this.timeline = properties.timeline;
        this.initializeUI();
    }

    protected setupUIElements() {
        super.setupUIElements();
        this.head = icon({icon: "scrubber-head", directory: "assets/misc"});
        this.markingMenuHandle = div();
    }

    protected setupUILayout() {
        super.setupUILayout();
        this.addChild([this.head, this.markingMenuHandle]);
    }

    protected setupUIListeners() {
        super.setupUIListeners();

        //Drag start --> start scrubbing and stop propagation
        this.head.addListener(TurboEventName.dragStart, (e: TurboDragEvent) => {
            this.scrubbing = true;
            if (this.onScrubbingStart) this.onScrubbingStart(e);
        });

        //On drag and if scrubbing --> stop propagation and move scrubber by delta position
        document.addListener(TurboEventName.drag, (e: TurboDragEvent) => {
            if (!this.scrubbing) return;
            e.stopImmediatePropagation();
            if (this.onScrubbing) this.onScrubbing(e);
        });

        //Drag end and if scrubbing --> end scrubbing and stop propagation
        document.addListener(TurboEventName.dragEnd, (e: TurboDragEvent) => {
            if (!this.scrubbing) return;
            this.scrubbing = false;
            if (this.onScrubbingEnd) this.onScrubbingEnd(e);
        });

        Scrubber.markingMenu.attachTo(this.markingMenuHandle,
            (e: TurboEvent) => {
                Scrubber.markingMenu.scrubber = this;
                Scrubber.markingMenu.show(true, e.scaledPosition);
            }, (e: TurboDragEvent) => {
                Scrubber.markingMenu.scrubber = this;
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
}
