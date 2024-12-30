import {Component} from "./component";
import {Model} from "./model";

export class View<
    ComponentType extends Component<any, any> = Component<any, any>,
    ModelType extends Model = Model
> {
    protected readonly element: ComponentType;

    public constructor(element: ComponentType) {
        this.element = element;

        this.setupUIElements();
        this.setupUILayout();
        this.setupUIListeners();
    }

    protected get model(): ModelType {
        return this.element.model;
    }

    protected setupUIElements(): void {
    }

    protected setupUILayout(): void {
    }

    protected setupUIListeners(): void {
    }
}