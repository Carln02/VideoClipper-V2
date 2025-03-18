import {define, div, TurboElement, TurboProperties} from "turbodombuilder";
import "./captureButton.css";
import {CaptureMode} from "../../../../../../managers/captureManager/captureManager.types";

@define("vc-capture-button")
export class CaptureButton extends TurboElement {
    private lowerDiv: HTMLDivElement;
    private upperDiv: HTMLDivElement;

    private innerIcon: HTMLDivElement;

    constructor(properties: TurboProperties = {}) {
        super(properties);
        this.lowerDiv = div({parent: this});
        this.upperDiv = div({parent: this});
        this.innerIcon = div({parent: this.upperDiv, classes: "inner-icon"});

        this.addListener("vc-click-start", () => this.upperDiv.style.transform = "scale(0.7)");
        this.addListener("vc-click-end", () => this.upperDiv.style.transform = "scale(1)");
    }

    public updateState(mode: CaptureMode) {
        this.toggleClass("video", mode == CaptureMode.video);
        this.toggleClass("video-capturing", mode == CaptureMode.videoShooting);
    }
}
