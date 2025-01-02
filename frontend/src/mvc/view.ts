import {Component} from "./component";
import {Model} from "./model";

export class View<
    ComponentType extends Component<any, any, any> = Component<any, any, any>,
    ModelType extends Model = Model
> {
    public element: ComponentType;
    public model: ModelType;

    protected callbackMap: Map<string, (...args: any[]) => void> = new Map();

    public constructor(element: ComponentType, model?: ModelType) {
        this.element = element;
        if (model) this.model = model;
    }

    public initialize(): void {
        this.setupChangedCallbacks();
        this.setupUIElements();
        this.setupUILayout();
        this.setupUIListeners();
    }

    protected setupChangedCallbacks(): void {
    }

    protected setupUIElements(): void {
    }

    protected setupUILayout(): void {
    }

    protected setupUIListeners(): void {
    }

    public fireChangedCallback(keyName: string, ...args: any[]): void {
        const callback = this.callbackMap.get(keyName);
        if (callback && typeof callback == "function") callback(...args);
    }

    protected setChangedCallback(keyName: string, callback: (...args: any[]) => void): void {
        this.callbackMap.set(keyName, callback);
    }
}