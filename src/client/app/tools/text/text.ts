import {Tool} from "../tool/tool";
import {Card} from "../../components/card/card";
import {ContextManager} from "../../managers/contextManager/contextManager";
import {ContextView} from "../../managers/contextManager/contextManager.types";
import {ClipRenderer} from "../../components/clipRenderer/clipRenderer";
import {Point, TurboEvent} from "turbodombuilder";
import {ToolType} from "../../managers/toolManager/toolManager.types";
import {Clip} from "../../components/clip/clip";

export class TextTool extends Tool {
    constructor() {
        super(ToolType.text);
    }

    public clickAction(e: TurboEvent) {
        if (ContextManager.instance.view == ContextView.canvas) {
            const closestCard = e.closest(Card, false);
            if (!closestCard) return;
            closestCard.editTitle();
            e.stopImmediatePropagation();
        }

        else if (ContextManager.instance.view == ContextView.camera) {
            const closestRenderer = e.closest(ClipRenderer);
            if (!closestRenderer) return;

            const rendererBounds = closestRenderer.getBoundingClientRect();
            ContextManager.instance.getOfType(Clip).addText(new Point(
                (e.position.x - rendererBounds.left) / rendererBounds.width,
                (e.position.y - rendererBounds.top) / rendererBounds.height
            ));
        }
    }
}