import {YModel} from "./yModel/yModel";
import {YView} from "./yView";
import {Component} from "../../mvc/component";
import {auto} from "turbodombuilder";

/**
 * @class YComponent
 * @extends TurboElement
 * @description A general class representing a component attached to a Ywrapped data object. It takes as a
 * generic the datatype of the data that is shared through Yjs. Components that extend this class would ideally
 * include defined callbacks that will be triggered by Thibaut's Ywrapper accordingly when the attached data changes.
 * @template DataType
 */
export abstract class YComponent<
    ViewType extends YView<any, any> = YView<any, any>,
    DataType extends object = object,
    ModelType extends YModel<DataType, any, any> = YModel<DataType>
> extends Component<ViewType, DataType, ModelType> {
    /**
     * @description The ID of this component's main attached data (if any) in the parent object.
     */
    public id: string;

    /**
     * @description Whether the element is selected or not. Setting it will accordingly toggle the "selected" CSS
     * class on the element and update the UI.
     */
    @auto()
    public set selected(value: boolean) {
        this.toggleClass("selected", value);
    }

    /**
     * @description The ID of this component's attached data in the parent object if it is a number, otherwise NaN.
     * Useful usually when the parent is an array and the ID is the data's index in the array.
     */
    public get index(): number {
        return Number.parseInt(this.id);
    }

    public set data(value: DataType & any) {
        this.model.data = value;
    }

    public get data(): DataType & any {
        return this.model.data;
    }
}