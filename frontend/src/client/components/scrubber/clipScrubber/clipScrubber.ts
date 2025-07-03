import {define, Direction, div, icon, TurboDragEvent, TurboEvent, TurboIcon} from "turbodombuilder";
import "./clipScrubber.css";
import {ScrubberProperties} from "../scrubber.types";
import {ScrubberMarkingMenu} from "../../scrubberMarkingMenu/scrubberMarkingMenu";
import {Scrubber} from "../scrubber";

@define("vc-clip-scrubber")
export class ClipScrubber extends Scrubber {
    protected static markingMenu: ScrubberMarkingMenu;

    protected head: TurboIcon;
    protected markingMenuHandle: HTMLDivElement;

    public constructor(properties: ScrubberProperties = {}, orientation: Direction = Direction.vertical) {
        super({...properties, initialize: false});
        this.addClass("vc-clip-scrubber");

        this.orientation = orientation;
        //this.orientation == Direction.vertical ? this.addClass("vc-scrubber-v") : this.addClass("vc-scrubber-h");

        this.toggleClass("vc-scrubber-v", orientation === Direction.vertical);
        this.toggleClass("vc-scrubber-h", orientation === Direction.horizontal);

        if (!ClipScrubber.markingMenu) {
            ClipScrubber.markingMenu = new ScrubberMarkingMenu({scrubber: this});
            this.director.addChild(ClipScrubber.markingMenu);
        }

        if (properties.initialize) this.initializeUI();
    }

    protected setupUIElements() {
        super.setupUIElements();
        this.head = icon({icon: "scrubber-head", directory: "/assets/misc"});
        this.markingMenuHandle = div();
    }

    protected setupUILayout() {
        super.setupUILayout();
        this.addChild([this.head, this.markingMenuHandle]);
    }

    protected setupUIListeners() {
        super.setupUIListeners();

        ClipScrubber.markingMenu.attachTo(this.markingMenuHandle,
            (e: TurboEvent) => {
                ClipScrubber.markingMenu.scrubber = this;
                ClipScrubber.markingMenu.show(true, e.position);
            }, (e: TurboDragEvent) => {
                ClipScrubber.markingMenu.scrubber = this;
                ClipScrubber.markingMenu.show(undefined, e.origins.first);
            });
    }
}
