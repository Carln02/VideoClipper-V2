import {define, div, icon, TurboDragEvent, TurboEvent, TurboIcon} from "turbodombuilder";
import "./clipScrubber.css";
import {ScrubberProperties} from "../scrubber.types";
import {ScrubberMarkingMenu} from "../../scrubberMarkingMenu/scrubberMarkingMenu";
import {Scrubber} from "../scrubber";

@define("vc-clip-scrubber")
export class ClipScrubber extends Scrubber {
    protected static markingMenu: ScrubberMarkingMenu;

    protected head: TurboIcon;
    protected markingMenuHandle: HTMLDivElement;

    public constructor(properties: ScrubberProperties = {}) {
        super({...properties, initialize: false});
        this.addClass("vc-clip-scrubber");

        if (!ClipScrubber.markingMenu) {
            ClipScrubber.markingMenu = new ScrubberMarkingMenu({});
            this.director.canvas.content.addChild(ClipScrubber.markingMenu);
        }

        if (properties.initialize) this.initializeUI();
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

        ClipScrubber.markingMenu.attachTo(this.markingMenuHandle,
            (e: TurboEvent) => {
                ClipScrubber.markingMenu.scrubber = this;
                ClipScrubber.markingMenu.show(true, this.scaled ? e.scaledPosition : e.position);
            }, (e: TurboDragEvent) => {
                ClipScrubber.markingMenu.scrubber = this;
                ClipScrubber.markingMenu.show(undefined, this.scaled ? e.scaledOrigins.first : e.origins.first);
            });
    }
}
