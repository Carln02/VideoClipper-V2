import {View} from "./view";
import {Model} from "./model";
import {TurboElement} from "turbodombuilder";
import {MvcTurboProperties} from "./mvc.types";

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
    DataType extends object = object,
    ModelType extends Model<DataType> = Model<any>
> extends TurboElement {
    private _model: ModelType;
    private _view: ViewType;

    public constructor(properties: MvcTurboProperties<ViewType, DataType, ModelType> = {}) {
        super(properties);
        if (properties.view) this.setView(properties.view);
        if (properties.model) {
            this.setModel(properties.model);
            if (properties.data) this.model.data = properties.data;
        }
    }

    public get data(): DataType {
        return this.model.data;
    }

    public get dataSize(): number {
        return this.model.getSize();
    }

    protected get view(): ViewType {
        return this._view;
    }

    protected get model(): ModelType {
        return this._model;
    }

    public setView(view: ViewType) {
        this._view = view;
    }

    public setModel(model: ModelType) {
        this._model = model;
        if (this.view) this.attachModelToView();
    }

    protected generateViewAndModel(
        viewConstructor: new (element: Component, model: ModelType) => ViewType,
        modelConstructor: new (data?: DataType) => ModelType,
        data?: DataType,
        initialize: boolean = true,
        force: boolean = false
    ) {
        if (!this.model || force) this.setModel(new modelConstructor(data));
        if (!this.view || force) {
            this.setView(new viewConstructor(this, this.model));
            this.attachModelToView();
        }
        if (initialize) this.initialize();
    }

    private attachModelToView() {
        this.view.model = this.model;
        this.model.keyChangedCallback = (keyName: string, ...args: any[]) =>
            this.view.fireChangedCallback(keyName, ...args);
    }

    protected initialize() {
        this.view.initialize();
        this.model.initialize();
    }
}