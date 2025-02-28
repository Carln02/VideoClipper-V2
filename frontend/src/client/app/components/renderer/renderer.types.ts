import {TurboProperties} from "turbodombuilder";
import {RendererView} from "./renderer.view";
import {RendererModel} from "./renderer.model";

export type RendererProperties<
    ViewType extends RendererView = RendererView<any, any>,
    ModelType extends RendererModel = RendererModel
> = TurboProperties<"div", ViewType, object, ModelType> & {
    canvasProperties?: TurboProperties<"canvas">,
    videoProperties?: TurboProperties<"video">
};