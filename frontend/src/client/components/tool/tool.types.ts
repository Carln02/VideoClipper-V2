import {TurboModel, TurboRichElementProperties, TurboView} from "turbodombuilder";
import {Project} from "../../directors/project/project";

export type ToolProperties<
    ViewType extends TurboView = TurboView,
    DataType extends object = object,
    ModelType extends TurboModel<DataType> = TurboModel
> = TurboRichElementProperties<"h4", ViewType, DataType, ModelType> & {
    director: Project
};