import {TurboElement, TurboProperties} from "turbodombuilder";
import {generate_unique_id, documentRoot} from "../../../sync/datastore";
import {YProxied, YProxiedArray} from "../../../../yProxy";

/**
 * @class SyncedComponent
 * @extends TurboElement
 * @description A general class representing a component attached to a Ywrapped data object. It takes as a
 * generic the datatype of the data that is shared through Yjs. Components that extend this class would ideally
 * include defined callbacks that will be triggered by Thibaut's Ywrapper accordingly when the attached data changes.
 * @template {YProxied} DataType
 */
export abstract class SyncedComponent<DataType extends YProxied = YProxied> extends TurboElement {
    private _data: DataType;
    private _selected: boolean = false;

    protected constructor(properties: TurboProperties = {}) {
        super(properties);
    }

    protected abstract setupCallbacks(newData: DataType, oldData: DataType): void;

    /**
     * @static
     * @description The root of the Yjs document.
     */
    //TODO REMOVE
    public static get root(): any {
        return documentRoot();
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
    public static async createInObject(data: object, parentData: YProxied): Promise<string> {
        const id = await generate_unique_id(parentData) as string;
        parentData[id] = data;
        return id;
    }

    /**
     * @function createInArray
     * @static
     * @description Adds the provided data in the provided parent array in the Yjs document.
     * @param {object} data - The data to append to the Yjs document.
     * @param {YProxiedArray} parentData - The pointer to the parent array to which the data should be appended in
     * the Yjs document.
     * @param {number} [index] - The index position in the array where the data should be added. By default, the data
     * is pushed at the end of the array.
     * @returns {number} - The index of the data in its parent.
     */
    public static createInArray(data: object, parentData: YProxiedArray, index?: number): number {
        if (index == undefined || index > parentData.length) {
            index = parentData.length;
            parentData.push(data);
        } else {
            if (index < 0) index = 0;
            parentData.splice(index, 0, data);
        }
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
        const oldData = this.data;
        oldData?.unbindObjectDeep(this);
        this._data = value;
        value.bindObject(this);
        this.setupCallbacks(value, oldData);
    }

    /**
     * @description The ID of this component's attached data in the parent object.
     */
    public get id(): string {
        return this.data.id;
    }

    /**
     * @description The ID of this component's attached data in the parent object if it is a number, otherwise NaN.
     * Useful usually when the parent is an array and the ID is the data's index in the array.
     */
    public get index(): number {
        return this.data.index;
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
        delete this.data.parent[this.data.key];
        if ("destroy" in this && typeof this.destroy == "function") this.destroy();
        //TODO IMPLEMENT DESTROY ALL BOUND ELEMENTS IN PROXY
    }
}