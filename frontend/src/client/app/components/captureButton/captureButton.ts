import {DefaultEventName, define, div, TurboElement, TurboProperties} from "turbodombuilder";
import "./captureButton.css";
import {CaptureMode} from "../../panels/shootingPanel/shootingPanel.types";

@define()
export class CaptureButton extends TurboElement {
    private lowerDiv: HTMLDivElement;
    private upperDiv: HTMLDivElement;
    private innerIcon: HTMLDivElement;

    public constructor(properties: TurboProperties = {}) {
        super(properties);
        this.initializeUI();
    }

    public updateState(mode: CaptureMode) {
        this.toggleClass("video", mode == CaptureMode.video);
        this.toggleClass("video-capturing", mode == CaptureMode.videoShooting);
    }

    protected setupUIElements() {
        super.setupUIElements();

        this.lowerDiv = div();
        this.upperDiv = div();
        this.innerIcon = div({classes: "inner-icon"});
    }

    protected setupUILayout() {
        super.setupUILayout();

        this.addChild([this.lowerDiv, this.upperDiv]);
        this.upperDiv.addChild(this.innerIcon);
    }

    protected setupUIListeners() {
        super.setupUIListeners();

        this.addListener(DefaultEventName.clickStart, () => this.upperDiv.setStyle("transform", "scale(0.7)"));
        this.addListener(DefaultEventName.clickEnd, () => this.upperDiv.setStyle("transform", "scale(1)"));
    }
}
