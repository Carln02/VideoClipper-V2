import {TurboElement, TurboProperties} from "turbodombuilder";
import {View} from "./view";
import {Model} from "./model";

/**
 * @class YComponent
 * @extends TurboElement
 * @description A general class representing a component attached to a Ywrapped data object. It takes as a
 * generic the datatype of the data that is shared through Yjs. Components that extend this class would ideally
 * include defined callbacks that will be triggered by Thibaut's Ywrapper accordingly when the attached data changes.
 * @template DataType
 */
export abstract class Component<
    ViewType extends View<any, any> = View<any, any>,
    ModelType extends Model = Model
> extends TurboElement {
    private _model: ModelType;
    private _view: ViewType;

    protected constructor(properties: TurboProperties = {}) {
        super(properties);
    }

    public get model(): ModelType {
        return this._model;
    }

    protected set model(value: ModelType) {
        this._model = value;
    }

    public get view(): ViewType {
        return this._view;
    }

    protected set view(value: ViewType) {
        this._view = value;
    }
}