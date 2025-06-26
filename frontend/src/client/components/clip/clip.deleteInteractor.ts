import {TurboInteractor} from "turbodombuilder";
import {ToolType} from "../../directors/project/project.types";
import {Clip} from "./clip";
import {ClipView} from "./clip.view";
import {ClipModel} from "./clip.model";

export class ClipDeleteInteractor extends TurboInteractor<ToolType, Clip, ClipView, ClipModel> {
    public tool = ToolType.delete;

    public click() {
        this.element.card.removeClip(this.element);
    }
}