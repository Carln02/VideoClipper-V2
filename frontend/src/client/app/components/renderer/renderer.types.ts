import {TurboProperties} from "turbodombuilder";
import {RendererView} from "./renderer.view";
import {RendererModel} from "./renderer.model";
import {VcComponentProperties} from "../component/component.types";
import {DocumentManager} from "../../managers/documentManager/documentManager";

export type RendererProperties<
    ViewType extends RendererView = RendererView<any, any>,
    ModelType extends RendererModel = RendererModel
> = VcComponentProperties<ViewType, object, ModelType, DocumentManager> & {
    canvasProperties?: TurboProperties<"canvas">,
    videoProperties?: TurboProperties<"video">
};