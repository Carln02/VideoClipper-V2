import {TurboCustomProperties, TurboSelectEntry} from "turbodombuilder";

export type CaptureModeSliderProperties = TurboCustomProperties & {
    values: (string | TurboSelectEntry)[]
};