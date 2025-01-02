import {TurboProperties} from "turbodombuilder";
import {View} from "./view";
import {Model} from "./model";

export type MvcTurboProperties<
    ViewType extends View = View,
    DataType extends object = object,
    ModelType extends Model = Model,
    PropertiesType extends TurboProperties = TurboProperties
> = PropertiesType & {
    data?: DataType,
    view?: ViewType,
    model?: ModelType
};