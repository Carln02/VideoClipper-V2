import {TurboCustomProperties, TurboModel, TurboView} from "turbodombuilder";
import {Director} from "../../directors/director/director";

export type VcComponentProperties<
    ViewType extends TurboView = TurboView,
    DataType extends object = object,
    ModelType extends TurboModel = TurboModel,
    DirectorType extends Director = Director
> = TurboCustomProperties<ViewType, DataType, ModelType> & {
    director?: DirectorType
};