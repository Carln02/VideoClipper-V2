import {TurboInteractor} from "turbodombuilder";
import {ToolType} from "../../directors/project/project.types";
import {Clip} from "./clip";
import {ClipView} from "./clip.view";
import {ClipModel} from "./clip.model";

export class ClipShootingInteractor extends TurboInteractor<ToolType, Clip, ClipView, ClipModel> {
    public tool = ToolType.shoot;
    public propagateUp = true;

    public clickStart() {
        this.element.director.contextManager.setContext(this.element, 2);
    }

    public click() {
        this.element.director.camera.snapToClip(this.element);
    }
}