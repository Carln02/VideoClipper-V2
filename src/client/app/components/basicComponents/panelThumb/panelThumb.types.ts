import {TurboProperties} from "turbodombuilder";

export type PanelThumbProperties = TurboProperties & {
    direction?: Direction,
    fitSizeOf?: HTMLElement,
    panel?: HTMLElement,
    initiallyClosed?: boolean,
    closedOffset?: number,
    openOffset?: number,
    invertOpenAndClosedValues?: boolean,
}

export enum Direction {
    top = "top",
    bottom = "bottom",
    left = "left",
    right = "right"
}