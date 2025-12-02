import {TurboElementProperties} from "turbodombuilder";

export type ResizableType = {
    boxWidth?: number,
    boxHeight?: number,
};

export type SyncedResizableType = {
    boxWidth?: number,
    boxHeight?: number,
};

export type ResizerProperties = TurboElementProperties & {
    content?: Element
};