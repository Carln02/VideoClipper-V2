import {TurboElement, TurboModel, TurboView} from "turbodombuilder";
import {ScreenManager} from "../../managers/screenManager/screenManager";
import {VcComponentProperties} from "./component.types";

export class VcComponent<
    ViewType extends TurboView = TurboView<any, any>,
    DataType extends object = object,
    ModelType extends TurboModel = TurboModel,
    ManagerType extends ScreenManager = ScreenManager
> extends TurboElement<ViewType, DataType, ModelType> {
    public screenManager: ManagerType;

    public constructor(properties: VcComponentProperties<ViewType, DataType, ModelType, ManagerType>) {
        super(properties);
        this.screenManager = properties.screenManager;
    }
}