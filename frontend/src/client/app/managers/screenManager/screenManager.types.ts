import {
    PartialRecord,
    Shown,
    StatefulReifect,
    StatefulReifectProperties,
    TurboModel,
    TurboView
} from "turbodombuilder";
import {VcComponent} from "../../components/component/component";
import {VcComponentProperties} from "../../components/component/component.types";
import {ScreenManager} from "./screenManager";

export type ScreenManagerProperties<
    ScreenType extends string | number | symbol = string | number | symbol,
    ViewType extends TurboView = TurboView<any, any>,
    DataType extends object = object,
    ModelType extends TurboModel<DataType> = TurboModel,
    ManagerType extends ScreenManager = ScreenManager
> = VcComponentProperties<ViewType, DataType, ModelType, ManagerType> & {
    showReifect?: StatefulReifect<Shown> | StatefulReifectProperties<Shown>,
    screens?: PartialRecord<ScreenType, VcComponent>,
    screensParent?: Node
};