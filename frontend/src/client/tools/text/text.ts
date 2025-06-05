import {Tool} from "../tool/tool";
import {Card} from "../../components/card/card";
import {ClipRenderer} from "../../components/clipRenderer/clipRenderer";
import {Point, TurboEvent} from "turbodombuilder";
import {ToolType} from "../../managers/toolManager/toolManager.types";
import {Clip} from "../../components/clip/clip";
import {Project} from "../../directors/project/project";
import {ProjectScreens} from "../../directors/project/project.types";

export class TextTool extends Tool {
    public constructor(project: Project) {
        super(project, ToolType.text);
    }

    public clickAction(e: TurboEvent) {
        if (this.project.currentType == ProjectScreens.canvas) {
            const closestCard = e.closest(Card, false);
            if (!closestCard) return;
            closestCard.editTitle();
            e.stopImmediatePropagation();
        }

        else if (this.project.currentType == ProjectScreens.camera) {
            const closestRenderer = e.closest(ClipRenderer);
            if (!closestRenderer) return;

            const rendererBounds = closestRenderer.getBoundingClientRect();
            this.contextManager.getOfType(Clip).addText(new Point(
                (e.position.x - rendererBounds.left) / rendererBounds.width,
                (e.position.y - rendererBounds.top) / rendererBounds.height
            ));
        }
    }
}