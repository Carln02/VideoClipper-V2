import {TurboModel, TurboView} from "turbodombuilder";
import {ToolPanel} from "../toolPanel/toolPanel";
import {DocumentManager} from "../../managers/documentManager/documentManager";
import {VcComponentProperties} from "../../components/component/component.types";

export type ToolPanelContentProperties<
    ViewType extends TurboView = TurboView,
    DataType extends object = object,
    ModelType extends TurboModel = TurboModel
> = VcComponentProperties<ViewType, DataType, ModelType, DocumentManager> & {
    toolPanel: ToolPanel,
    hasSave?: boolean,
    hasClear?: boolean,
    hasBack?: boolean,
};