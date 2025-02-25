import {TurboCustomProperties, TurboModel, TurboView} from "turbodombuilder";

export type PanelThumbProperties<
    ViewType extends TurboView = TurboView,
    DataType extends object = object,
    ModelType extends TurboModel = TurboModel,
> = TurboCustomProperties<ViewType, DataType, ModelType> & {
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