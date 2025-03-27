import {TurboCustomProperties, TurboModel, TurboView} from "turbodombuilder";
import {ToolPanel} from "../toolPanel/toolPanel";

export type ToolPanelContentProperties<
    ViewType extends TurboView = TurboView,
    DataType extends object = object,
    ModelType extends TurboModel = TurboModel
> = TurboCustomProperties<ViewType, DataType, ModelType> & {
    toolPanel: ToolPanel,
    hasSave?: boolean,
    hasClear?: boolean,
    hasBack?: boolean,
};