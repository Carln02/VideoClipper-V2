import {TurboProperties} from "turbodombuilder";
import {RendererView} from "./renderer.view";
import {RendererModel} from "./renderer.model";
import {VcComponentProperties} from "../component/component.types";
import {Project} from "../../directors/project/project";

export type RendererProperties<
    ViewType extends RendererView = RendererView<any, any>,
    ModelType extends RendererModel = RendererModel
> = VcComponentProperties<ViewType, object, ModelType, Project> & {
    canvasProperties?: TurboProperties<"canvas">,
    videoProperties?: TurboProperties<"video">
};