import {TurboElement, TurboProperties} from "turbodombuilder";
import {generate_unique_id, get_doc} from "../../../sync/datastore";
import {DocumentData} from "../../views/canvas/canvas.types";
import {SyncedArray, SyncedType} from "./syncedComponent.types";

/**
 * @class SyncedComponent
 * @extends TurboElement
 * @description A general class representing a component attached to a Ywrapped data object. It takes as a
 * generic the datatype of the data that is shared through Yjs. Components that extend this class would ideally
 * include defined callbacks that will be triggered by Thibaut's Ywrapper accordingly when the attached data changes.
 * @template {SyncedType} DataType
 */
export abstract class SyncedComponent<DataType extends SyncedType = SyncedType> extends TurboElement {
    private _data: DataType;
    private _selected: boolean = false;

    protected constructor(properties: TurboProperties = {}) {
        super(properties);
    }

    /**
     * @static
     * @description The root of the Yjs document.
     */
    public static get root(): DocumentData {
        return get_doc() as DocumentData;
    }

    /**
     * @function createInObject
     * @static
     * @async
     * @description Adds the provided data in the provided parent in the Yjs document, with a unique ID as its field
     * name.
     * @param {object} data - The data to append to the Yjs document.
     * @param {YWrappedObject} parentData - The pointer to the parent to which the data should be appended in the Yjs
     * document.
     * @returns {Promise<string>} - The ID of the data in its parent.
     */
    public static async createInObject(data: object, parentData: SyncedType): Promise<string> {
        const id = await generate_unique_id(parentData) as string;
        parentData[id] = data;
        parentData[id].set_observable();
        return id;
    }

    /**
     * @function createInArray
     * @static
     * @description Adds the provided data in the provided parent array in the Yjs document.
     * @param {object} data - The data to append to the Yjs document.
     * @param {SyncedArray} parentData - The pointer to the parent array to which the data should be appended in
     * the Yjs document.
     * @param {number} [index] - The index position in the array where the data should be added. By default, the data
     * is pushed at the end of the array.
     * @returns {number} - The index of the data in its parent.
     */
    public static createInArray(data: object, parentData: SyncedArray, index?: number): number {
        if (index == undefined || index > parentData.length) {
            index = parentData.length;
            parentData.push(data as SyncedType);
        } else {
            if (index < 0) index = 0;
            parentData.splice(index, 0, data as SyncedType);
        }
        parentData[index].set_observable();
        return index;
    }

    /**
     * @description The observed data. When it is set, this component will unobserve the previously set data (if any)
     * and observe the new data.
     */
    public get data(): DataType {
        return this._data;
    }

    public set data(value: DataType) {
        this.data?.unobserve(this);
        this._data = value;
        if (value?.observe) value.observe(this);
    }

    /**
     * @description The ID of this component's attached data in the parent object.
     */
    public get id(): string {
        return this.data.get_key().toString();
    }

    /**
     * @description The ID of this component's attached data in the parent object if it is a number, otherwise NaN.
     * Useful usually when the parent is an array and the ID is the data's index in the array.
     */
    public get index(): number {
        const key = this.data.get_key();
        return typeof key == "number" ? key : NaN;
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

    /**
     * @function delete
     * @description Deletes the attached data from the Yjs document, and destroys all elements that observe it
     * (including this component).
     */
    public delete() {
        this.data.destroy_observers();
        delete this.data.get_parent()[this.data.get_key() as (string | number)];
    }
}
