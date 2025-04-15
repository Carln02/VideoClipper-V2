import {TurboModel} from "turbodombuilder";
import {CaptureMode} from "./shootingPanel.types";

export class ShootingPanelModel extends TurboModel {
    private _mode: CaptureMode;

    public get mode(): CaptureMode {
        return this._mode;
    }

    public set mode(value: CaptureMode) {
        if (this.mode == value) return;
        if (this.mode == CaptureMode.videoShooting) this.fireCallback("stopShooting");
        this._mode = value as CaptureMode;
        this.fireCallback("modeChanged");
    }
}