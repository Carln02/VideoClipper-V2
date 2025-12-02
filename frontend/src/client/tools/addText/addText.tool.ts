import {Point, TurboEvent, TurboTool} from "turbodombuilder";
import {Tool} from "../../components/tool/tool";
import {ToolType} from "../../directors/project/project.types";
import {Clip} from "../../components/clip/clip";
import {Playback} from "../../components/playback/playback";

export class AddTextTool extends TurboTool<Tool> {
    public toolName = ToolType.createText;

    public click(e: TurboEvent, target: Node) {
        if (!(target instanceof Playback)) return;
        const rendererBounds = target.renderer.getBoundingClientRect();
        this.element.director.contextManager.getOfType(Clip).addText(new Point(
            (e.position.x - rendererBounds.left) / rendererBounds.width,
            (e.position.y - rendererBounds.top) / rendererBounds.height
        ));
        return true;
    }
}