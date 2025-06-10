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
import {Director} from "./director";

export type DirectorProperties<
    ScreenType extends string | number | symbol = string | number | symbol,
    ViewType extends TurboView = TurboView<any, any>,
    DataType extends object = object,
    ModelType extends TurboModel<DataType> = TurboModel,
    DirectorType extends Director = Director
> = VcComponentProperties<ViewType, DataType, ModelType, DirectorType> & {
    showReifect?: StatefulReifect<Shown> | StatefulReifectProperties<Shown>,
    screens?: PartialRecord<ScreenType, VcComponent>,
    screensParent?: Node
};