import {TurboModel} from "turbodombuilder";

export class CameraModel extends TurboModel {
    public readonly aspectRatio = 1.33 as const;

    private videoStreamOn: boolean = false;
    private _ghosting: boolean = true;
}