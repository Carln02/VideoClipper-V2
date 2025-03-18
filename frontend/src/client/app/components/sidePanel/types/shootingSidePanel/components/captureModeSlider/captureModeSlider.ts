import {DefaultEventName, define, div, TurboDragEvent, TurboElement, TurboProperties} from "turbodombuilder";
import "./captureModeSlider.css";
import {ShootingSidePanel} from "../../shootingSidePanel";
import {linearInterpolation} from "../../../../../../../utils/interpolation";
import {CaptureMode} from "../../../../../../managers/captureManager/captureManager.types";

@define("capture-mode-slider")
export class CaptureModeSlider extends TurboElement {
    private readonly shootingSidePanel: ShootingSidePanel;

    private entries: HTMLElement[] = [];
    private _index = 0;
    private _translation = 0;

    private dragging = false;

    private entryWidth: number;

    constructor(shootingSidePanel: ShootingSidePanel, entries: CaptureMode[], properties: TurboProperties = {}) {
        super(properties);
        this.shootingSidePanel = shootingSidePanel;

        this.entries = entries.map((entry, index) => div({
            text: entry, parent: this, listeners: {
                [DefaultEventName.click]: () => {
                    this.toggleTransitions(true);
                    requestAnimationFrame(() => this.index = index);
                }
            }
        }));

        requestAnimationFrame(() => this.entryWidth = this.entries[0].offsetWidth);

        this.initEvents();
    }

    public get index() {
        return this._index;
    }

    public set index(value: number) {
        if (value > this.entries.length - 1) this._index = this.entries.length - 1;
        else if (value < 0) this._index = 0;
        else this._index = value;

        this.shootingSidePanel.mode = this.entries[this._index].innerText;

        this.translation = this._index * this.entryWidth;

        this.entries.forEach((item, index) =>
            item.classList.toggle("active", index === this._index));
    }

    private get translation() {
        return this._translation;
    }

    private set translation(value: number) {
        this._translation = value;
        this.setStyle("transform", `translate(0, ${value}px) rotate(-90deg)`);

        this.entries.forEach((item, index) => {
            const indexDifference = Math.abs(index - value / this.entryWidth);
            item.style.opacity = linearInterpolation(indexDifference, 0, 1.5, 1, 0.3).toString();
            item.style.transform = `scale(${linearInterpolation(indexDifference, 0, 1.5, 1.1, 0.8)})`;
        });
    }

    private initEvents() {
        this.addEventListener("vc-drag-start", (e: TurboDragEvent) => {
            e.stopImmediatePropagation();
            this.dragging = true;
            this.toggleTransitions(false);
        });

        document.addEventListener("vc-drag", (e: TurboDragEvent) => {
            if (!this.dragging) return;
            e.stopImmediatePropagation();
            this.translation += e.deltaPosition.y;
        });

        document.addEventListener("vc-drag-end", (e: TurboDragEvent) => {
            if (!this.dragging) return;
            e.stopImmediatePropagation();
            this.dragging = false;

            this.index = Math.round(this.translation / this.entryWidth);
        });
    }

    private toggleTransitions(b: boolean) {
        this.setStyle("transition", b ? "all 0.2s ease-in-out" : "");
        this.entries.forEach(entry => entry.style.transition = b ? "all 0.2s ease-in-out" : "");
    }
}
