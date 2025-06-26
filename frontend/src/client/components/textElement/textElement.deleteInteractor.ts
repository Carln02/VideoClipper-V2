import {TurboInteractor} from "turbodombuilder";
import {ToolType} from "../../directors/project/project.types";
import {TextElement} from "./textElement";
import {TextElementView} from "./textElement.view";
import {TextElementModel} from "./textElement.model";

export class TextElementDeleteInteractor extends TurboInteractor<ToolType, TextElement, TextElementView, TextElementModel> {
    public tool = ToolType.delete;

    public click() {
        this.element.clip.removeText(this.element);
    }
}