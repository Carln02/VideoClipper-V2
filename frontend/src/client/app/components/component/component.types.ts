import {TurboCustomProperties, TurboModel, TurboView} from "turbodombuilder";
import {ScreenManager} from "../../managers/screenManager/screenManager";

export type VcComponentProperties<
    ViewType extends TurboView = TurboView,
    DataType extends object = object,
    ModelType extends TurboModel = TurboModel,
    ManagerType extends ScreenManager = ScreenManager
> = TurboCustomProperties<ViewType, DataType, ModelType> & {
    screenManager?: ManagerType
};