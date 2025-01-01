import {YComponent} from "./yComponent";
import {YModel} from "./yModel/yModel";
import {View} from "../../mvc/view";

export class YView<
    ComponentType extends YComponent<any, any> = YComponent<any, any>,
    ModelType extends YModel = YModel
> extends View<ComponentType, ModelType> {
    public constructor(element: ComponentType, initialize: boolean = true) {
        super(element, initialize);
    }
}