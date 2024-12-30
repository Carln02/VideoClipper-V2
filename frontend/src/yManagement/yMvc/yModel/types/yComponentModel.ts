import {YMap, YMapEvent} from "../../../yManagement.types";
import {YModel} from "../yModel";
import {YComponent} from "../../yComponent";

/**
 * @class YComponent
 * @extends TurboElement
 * @description A general class representing a component attached to a Ywrapped data object. It takes as a
 * generic the datatype of the data that is shared through Yjs. Components that extend this class would ideally
 * include defined callbacks that will be triggered by Thibaut's Ywrapper accordingly when the attached data changes.
 * @template DataType
 */
export class YComponentModel<Element extends YComponent = YComponent> extends YModel<any, YMap, string> {
    public readonly element: Element;

    /**
     * @description The ID of this component's attached data in the parent object.
     */
    public id: string;

    public constructor(data: any, element: Element) {
        super(data);
        this.element = element;
    }

    /**
     * @description The ID of this component's attached data in the parent object if it is a number, otherwise NaN.
     * Useful usually when the parent is an array and the ID is the data's index in the array.
     */
    public get index(): number {
        return Number.parseInt(this.id);
    }

    protected getData(key: string, blockKey: string = this.defaultBlockKey): any {
        const data = this.getDataBlock(blockKey);
        if (!data || !(data instanceof YMap)) return undefined;
        return data.get(key);
    }

    protected setData(key: string, value: unknown, blockKey: string = this.defaultBlockKey) {
        const data = this.getDataBlock(blockKey);
        if (!data || !(data instanceof YMap)) return;
        data.set(key, value);
    }

    protected callbackOnKeyChange(key: string, blockKey: string = this.defaultBlockKey, deleted: boolean = false) {
        const callbackName = key + "Changed";
        const value = deleted ? undefined : this.getData(key, blockKey);

        const prototype = Object.getPrototypeOf(this.element.view);
        const callback = prototype?.[callbackName];

        if (typeof callback === "function") callback.call(this, value);
    }

    protected observeChanges(event: YMapEvent, blockKey: string | undefined): void {
        event.keysChanged.forEach(key => {
            const change = event.changes.keys.get(key);
            this.callbackOnKeyChange(key, blockKey, change.action == "delete");
        });
    }
}