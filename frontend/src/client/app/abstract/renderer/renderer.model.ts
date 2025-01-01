import {YComponentModel} from "../../../../yManagement/yMvc/yModel/types/yComponentModel";
import {Renderer} from "./renderer";

export class RendererModel<ComponentType extends Renderer = Renderer> extends YComponentModel<ComponentType> {
    public currentFill: string | CanvasImageSource = null;
}