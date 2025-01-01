import {define, div, TurboDragEvent, TurboElement, TurboProperties} from "turbodombuilder";
import "./resizer.css";

//TODO FIX AND MAKE MORE GENERIC
@define("vc-resizer")
export class Resizer extends TurboElement {
    private readonly content: Element;
    public parent: HTMLElement;

    constructor(content: Element, properties: TurboProperties = {}) {
        super(properties);

        this.content = content;
        this.parent = content.parentElement;

        this.initUI();
        this.show(false);
    }

    private initUI() {
        for (const direction of ["nw", "ne", "sw", "se"]) {
            div({
                parent:  this,
                classes: "resizer-handle resizer-handle-" + direction,
                listeners: {
                    "vc-drag": (e: TurboDragEvent) => {
                        e.stopImmediatePropagation();
                        this.incrementWidthByPx(e.deltaPosition.x
                            * ((direction == "nw" || direction == "sw") ? -2 : 2));
                        this.incrementHeightByPx(e.deltaPosition.y
                            * ((direction == "nw" || direction == "ne") ? -2 : 2));
                    }
                }
            });
        }
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