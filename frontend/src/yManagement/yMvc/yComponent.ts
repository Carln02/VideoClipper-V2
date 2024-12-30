import {TurboProperties} from "turbodombuilder";
import {YModel} from "./yModel/yModel";
import {YView} from "./yView";
import {Component} from "../../mvc/component";

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
    ModelType extends YModel = YModel
> extends Component<ViewType, ModelType> {
    private _selected: boolean = false;

    protected constructor(properties: TurboProperties = {}) {
        super(properties);
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
}