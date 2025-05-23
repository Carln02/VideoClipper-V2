import {Tool} from "../tool/tool";
import {Card} from "../../components/card/card";
import {ContextManager} from "../../managers/contextManager/contextManager";
import {ClipRenderer} from "../../components/clipRenderer/clipRenderer";
import {Point, TurboEvent} from "turbodombuilder";
import {ToolType} from "../../managers/toolManager/toolManager.types";
import {Clip} from "../../components/clip/clip";
import {DocumentManager} from "../../managers/documentManager/documentManager";
import {DocumentScreens} from "../../managers/documentManager/documentManager.types";

export class TextTool extends Tool {
    public constructor(documentManager: DocumentManager) {
        super(documentManager, ToolType.text);
    }

    public clickAction(e: TurboEvent) {
        if (this.documentManager.currentType == DocumentScreens.canvas) {
            const closestCard = e.closest(Card, false);
            if (!closestCard) return;
            closestCard.editTitle();
            e.stopImmediatePropagation();
        }

        else if (this.documentManager.currentType == DocumentScreens.camera) {
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