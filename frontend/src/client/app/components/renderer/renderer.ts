import "./renderer.css";
import {RendererView} from "./renderer.view";
import {RendererModel} from "./renderer.model";
import {RendererProperties} from "./renderer.types";
import {TurboElement} from "turbodombuilder";

export abstract class Renderer<
    ViewType extends RendererView = RendererView<any, any>,
    ModelType extends RendererModel = RendererModel
> extends TurboElement<ViewType, object, ModelType> {

    protected constructor(properties: RendererProperties<ViewType, ModelType> = {}) {
        super(properties);
    }

    public get width() {
        return this.view.width;
    }

    public get height() {
        return this.view.height;
    }

    public get video() {
        return this.view.video;
    }

    public resize(aspectRatio: number = 1.33, width: number = this.offsetWidth, height: number = this.offsetHeight) {
        this.view.resize(aspectRatio, width, height);
    }

    public setCanvas(fill: string | CanvasImageSource = this.model.currentFill) {
        this.view.setCanvas(fill);
    }
}