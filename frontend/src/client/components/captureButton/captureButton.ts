import {DefaultEventName, define, div, element, turbo, TurboElement, TurboElementProperties} from "turbodombuilder";
import "./captureButton.css";
import {CaptureMode} from "../../panels/shootingPanel/shootingPanel.types";

@define("vc-capture-button")
export class CaptureButton extends TurboElement {
    private lowerDiv: HTMLDivElement;
    private upperDiv: HTMLDivElement;
    private innerIcon: HTMLDivElement;

    public updateState(mode: CaptureMode) {
        turbo(this).toggleClass("video", mode == CaptureMode.video)
            .toggleClass("video-capturing", mode == CaptureMode.videoShooting);
    }

    protected setupUIElements() {
        super.setupUIElements();

        this.lowerDiv = div();
        this.upperDiv = div();
        this.innerIcon = div({classes: "inner-icon"});
    }

    protected setupUILayout() {
        super.setupUILayout();

        turbo(this).addChild([this.lowerDiv, this.upperDiv]);
        turbo(this.upperDiv).addChild(this.innerIcon);
    }

    protected setupUIListeners() {
        super.setupUIListeners();

        turbo(this).on(DefaultEventName.clickStart, () => {
            turbo(this.upperDiv).setStyle("transform", "scale(0.7)")
        }).on(DefaultEventName.clickEnd, () => {
            turbo(this.upperDiv).setStyle("transform", "scale(1)")
        });
    }
}

export function captureButton(properties: TurboElementProperties): CaptureButton {
    turbo(properties).applyDefaults({tag: "vc-capture-button"});
    return element({...properties}) as CaptureButton;
}

