import {
    DefaultEventName,
    define,
    element, turbo,
    TurboDragEvent,
    TurboElement,
} from "turbodombuilder";
import "./resizer.css";
import {ResizerProperties} from "./resizer.types";

//TODO FIX AND MAKE MORE GENERIC
@define("vc-resizer")
export class Resizer extends TurboElement {
    private readonly content: Element;
    public parent: HTMLElement;

    public initialize() {
        this.parent = this.content?.parentElement;
        turbo(this).show(false);

        super.initialize();

    }

    protected setupUIElements() {
        super.setupUIElements();

        for (const direction of ["nw", "ne", "sw", "se"]) turbo("div")
            .addToParent(this)
            .addClass("resizer-handle resizer-handle-" + direction)
            .on(DefaultEventName.drag, (e: TurboDragEvent) => {
                this.incrementWidthByPx(e.deltaPosition.x
                    * ((direction == "nw" || direction == "sw") ? -2 : 2));
                this.incrementHeightByPx(e.deltaPosition.y
                    * ((direction == "nw" || direction == "ne") ? -2 : 2));
                return true;
            });
    }

    public incrementWidthByPx(delta: number) {
        if ("boxWidth" in this.content && typeof this.content.boxWidth == "number") {
            this.content.boxWidth += delta / this.parent?.offsetWidth * 100;
        }
    }

    public incrementHeightByPx(delta: number) {
        if ("boxHeight" in this.content && typeof this.content.boxHeight == "number")
            this.content.boxHeight += delta / this.parent?.offsetHeight * 100;
    }
}

export function resizer(properties: ResizerProperties = {}): Resizer {
    turbo(properties).applyDefaults({tag: "vc-resizer"});
    return element({...properties}) as Resizer;
}