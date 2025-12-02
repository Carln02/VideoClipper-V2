import {TurboModel, TurboView} from "turbodombuilder";
import {ToolPanel} from "../toolPanel/toolPanel";
import {VcProperties} from "../../components/component/component.types";
import {Project} from "../../directors/project/project";

export type ToolPanelContentProperties<
    ViewType extends TurboView = TurboView,
    DataType extends object = object,
    ModelType extends TurboModel = TurboModel
> = VcProperties<ViewType, DataType, ModelType, Project> & {
    toolPanel: ToolPanel,
    hasSave?: boolean,
    hasClear?: boolean,
    hasBack?: boolean,
};