import {TurboModel, TurboView} from "turbodombuilder";
import {ToolPanel} from "../toolPanel/toolPanel";
import {VcComponentProperties} from "../../components/component/component.types";
import {Project} from "../../directors/project/project";

export type ToolPanelContentProperties<
    ToolType = string,
    ViewType extends TurboView = TurboView,
    DataType extends object = object,
    ModelType extends TurboModel = TurboModel
> = VcComponentProperties<ViewType, DataType, ModelType, Project> & {
    toolPanel: ToolPanel<ToolType>,
    hasSave?: boolean,
    hasClear?: boolean,
    hasBack?: boolean,
};