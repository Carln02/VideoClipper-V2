import {
    DefaultEventName,
    define,
    div,
    icon,
    TurboIcon,
    turbo, element
} from "turbodombuilder";
import "./clipScrubber.css";
import {ScrubberMarkingMenu} from "../../scrubberMarkingMenu/scrubberMarkingMenu";
import {Scrubber} from "../scrubber";
import {ScrubberProperties} from "../scrubber.types";

@define("vc-clip-scrubber")
export class ClipScrubber extends Scrubber {
    protected static markingMenu: ScrubberMarkingMenu;

    protected head: TurboIcon;
    protected markingMenuHandle: HTMLDivElement;

    public initialize(): void {
        super.initialize();
        // if (!ClipScrubber.markingMenu) {
        //     ClipScrubber.markingMenu = new ScrubberMarkingMenu({scrubber: this});
        //     turbo(this.director).addChild(ClipScrubber.markingMenu);
        // }
    }

    protected setupUIElements() {
        super.setupUIElements();
        this.head = icon({icon: "scrubber-head", directory: "/assets/misc"});
        this.markingMenuHandle = div();
    }

    protected setupUILayout() {
        super.setupUILayout();
        turbo(this).addChild([this.head, this.markingMenuHandle]);
    }

    protected setupUIListeners() {
        super.setupUIListeners();

        turbo(this.markingMenuHandle).on(DefaultEventName.drag, (e) => e.stopImmediatePropagation());

        // TOdo
        // ClipScrubber.markingMenu.attachTo(this.markingMenuHandle,
        //     (e: TurboEvent) => {
        //         e.stopImmediatePropagation();
        //         ClipScrubber.markingMenu.scrubber = this;
        //         ClipScrubber.markingMenu.show(true, e.position);
        //     }, (e: TurboDragEvent) => {
        //         e.stopImmediatePropagation();
        //         ClipScrubber.markingMenu.scrubber = this;
        //         ClipScrubber.markingMenu.show(undefined, e.origins.first);
        //     });
    }
}

export function clipScrubber(properties: ScrubberProperties): ClipScrubber {
    turbo(properties).applyDefaults({tag: "vc-clip-scrubber"});
    return element({...properties}) as ClipScrubber;
}
