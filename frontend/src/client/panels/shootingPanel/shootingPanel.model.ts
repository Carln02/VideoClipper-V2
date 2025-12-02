import {auto, TurboModel} from "turbodombuilder";
import {CaptureMode} from "./shootingPanel.types";

export class ShootingPanelModel extends TurboModel {
    @auto({
        callBefore: function () {
            if (this.mode === CaptureMode.videoShooting) this.fireCallback("stopShooting")
        }
    }) public set mode(value: CaptureMode) {
        this.fireCallback("modeChanged");
    }
}