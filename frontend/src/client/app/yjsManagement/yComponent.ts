import {TurboElement, TurboProperties} from "turbodombuilder";
import {YAbstractType, YMap, YArray, YMapEvent} from "../../../yProxy";

/**
 * @class YComponent
 * @extends TurboElement
 * @description A general class representing a component attached to a Ywrapped data object. It takes as a
 * generic the datatype of the data that is shared through Yjs. Components that extend this class would ideally
 * include defined callbacks that will be triggered by Thibaut's Ywrapper accordingly when the attached data changes.
 * @template DataType
 */
export abstract class YComponent<DataType = object, YType extends (YMap | YArray) = YMap> extends TurboElement {
    private dataMap: Map<string, YType> = new Map();
    private observerMap: Map<string, (event: YMapEvent) => void> = new Map();

    private _selected: boolean = false;

    /**
     * @description The ID of this component's attached data in the parent object.
     */
    public id: string;

    protected constructor(properties: TurboProperties = {}) {
        super(properties);
    }

    /**
     * @description The observed data. When it is set, this component will set again all the defined setters.
     */
    public get data(): DataType & YType {
        return this.getDataBlock() as DataType & YType;
    }

    public set data(value: DataType) {
        if (!(value instanceof YAbstractType)) return;
        this.setDataBlock(value as unknown as YType);
    }

    public getDataBlock(blockKey: string = this.defaultBlockKey): YType {
        return this.dataMap.get(blockKey);
    }

    public setDataBlock(value: YType, blockKey: string = this.defaultBlockKey) {
        this.dataMap.get(blockKey)?.unobserve(this.observerMap.get(blockKey) as any);

        this.dataMap.set(blockKey, value);
        value.forEach((_entry, key) => this.callbackOnKeyChange(key, blockKey));

        const observerFunction = (event: YMapEvent) =>
            event.keysChanged.forEach(key => {
                const change = event.changes.keys.get(key);
                this.callbackOnKeyChange(key, blockKey, change.action == "delete");
            });

        this.observerMap.set(blockKey, observerFunction);
        value.observe(observerFunction as any);
    }

    /**
     * @description The ID of this component's attached data in the parent object if it is a number, otherwise NaN.
     * Useful usually when the parent is an array and the ID is the data's index in the array.
     */
    public get index(): number {
        return Number.parseInt(this.id);
    }

    /**
     * @description Whether the element is selected or not. Setting it will accordingly toggle the "selected" CSS
     * class on the element and update the UI.
     */
    public get selected(): boolean {
        return this._selected;
    }

    public set selected(value: boolean) {
        this._selected = value;
        this.toggleClass("selected", value);
    }

    public getData(key: string, blockKey: string = this.defaultBlockKey): unknown {
        const data = this.getDataBlock(blockKey);
        if (!data || !(data instanceof YMap)) return undefined;
        return data.get(key);
    }

    public setData(key: string, value: unknown, blockKey: string = this.defaultBlockKey) {
        const data = this.getDataBlock(blockKey);
        if (!data || !(data instanceof YMap)) return;
        data.set(key, value);
    }

    public delete() {
    }

    protected get defaultBlockKey(): string {
        return this.dataMap.size > 1 ? null : this.dataMap.size > 0 ? this.dataMap.keys().next().value : "0";
    }

    protected callbackOnKeyChange(key: string, blockKey: string = this.defaultBlockKey, deleted: boolean = false) {
        const callbackName = key + "Changed";
        const value = deleted ? undefined : this.getData(key, blockKey);

        const prototype = Object.getPrototypeOf(this);
        const callback = prototype?.[callbackName];

        if (typeof callback === "function") callback.call(this, value);
    }
}