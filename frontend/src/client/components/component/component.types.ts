import {TurboElementProperties, TurboModel, TurboView} from "turbodombuilder";
import {Director} from "../../directors/director/director";

export type VcProperties<
    ViewType extends TurboView = TurboView,
    DataType extends object = object,
    ModelType extends TurboModel = TurboModel,
    DirectorType extends Director = Director
> = TurboElementProperties<ViewType, DataType, ModelType> & {
    director?: DirectorType
};