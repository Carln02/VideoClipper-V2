import {Tool} from "../tool/tool";
import {define, TurboEvent} from "turbodombuilder";
import {Card} from "../../components/card/card";
import {Camera} from "../../screens/camera/camera";
import {Clip} from "../../components/clip/clip";
import {ToolType} from "../../managers/toolManager/toolManager.types";
import {DocumentManager} from "../../managers/documentManager/documentManager";
import {DocumentScreens} from "../../managers/documentManager/documentManager.types";

/**
 * @description Tool that allows the user to shoot video clips into a card
 */
@define("shoot-tool")
export class ShootTool extends Tool {

    public constructor(documentManager: DocumentManager) {
        super(documentManager, ToolType.shoot);
    }

    public activate() {
        // this.documentManager.camera?.startStream();
    }

    public deactivate() {
        this.documentManager.camera?.stopStream();
    }

    public clickAction(e: TurboEvent) {
        const closestClip = e.closest(Clip);

        //Get clicked card (if any) and shoot into it
        const closestCard = (closestClip ? closestClip.closest(Card) : e.closest(Card)) as Card;
        if (!closestCard) return;

        this.contextManager.setContext(closestCard, 1);
        if (closestClip) this.contextManager.setContext(closestClip, 2);
        else this.contextManager.setContext(closestCard.timeline.clips[closestCard.timeline.clips.length - 1], 2);

        this.documentManager.currentType = DocumentScreens.camera;
        const camera = this.documentManager.camera;

        camera.card = closestCard;
        this.documentManager.toolPanel.changePanel(ToolType.shoot);
        camera.startStream();
    }
}
