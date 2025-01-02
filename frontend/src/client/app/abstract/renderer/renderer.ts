import "./renderer.css";
import {YComponent} from "../../../../yManagement/yMvc/yComponent";
import {RendererView} from "./renderer.view";
import {RendererModel} from "./renderer.model";
import {RendererProperties} from "./renderer.types";

export abstract class Renderer<
    ViewType extends RendererView = RendererView<any, any>,
    ModelType extends RendererModel = RendererModel
> extends YComponent<ViewType, object, ModelType> {

    protected constructor(properties: RendererProperties<ViewType, ModelType> = {}) {
        super(properties);
        if (!properties.canvasProperties) properties.canvasProperties = {id: "card-frame-canvas"};
    }

    public get width() {
        return this.view.width;
    }

    public get height() {
        return this.view.height;
    }
}