import {Point, TurboEvent, TurboInteractor} from "turbodombuilder";
import {ToolType} from "../../directors/project/project.types";
import {Playback} from "./playback";
import {PlaybackView} from "./playback.view";
import {PlaybackModel} from "./playback.model";
import {Clip} from "../clip/clip";

export class PlaybackAddTextInteractor extends TurboInteractor<ToolType, Playback, PlaybackView, PlaybackModel> {
    public tool = ToolType.createText;

    public click(e: TurboEvent) {
        const rendererBounds = this.element.renderer.getBoundingClientRect();
        this.element.director.contextManager.getOfType(Clip).addText(new Point(
            (e.position.x - rendererBounds.left) / rendererBounds.width,
            (e.position.y - rendererBounds.top) / rendererBounds.height
        ));
    }
}