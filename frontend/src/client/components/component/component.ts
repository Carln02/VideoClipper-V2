import {TurboElement, TurboModel, TurboView} from "turbodombuilder";
import {VcComponentProperties} from "./component.types";
import {Director} from "../../directors/director/director";

export class VcComponent<
    ViewType extends TurboView = TurboView<any, any>,
    DataType extends object = object,
    ModelType extends TurboModel = TurboModel,
    DirectorType extends Director = Director
> extends TurboElement<ViewType, DataType, ModelType> {
    public director: DirectorType;

    public constructor(properties: VcComponentProperties<ViewType, DataType, ModelType, DirectorType> = {}) {
        super(properties);
        this.director = properties.director;
    }
}