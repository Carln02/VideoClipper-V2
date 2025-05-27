import {Tool} from "../tool/tool";
import {define, TurboEvent} from "turbodombuilder";
import {Card} from "../../components/card/card";
import {Clip} from "../../components/clip/clip";
import {ToolType} from "../../managers/toolManager/toolManager.types";
import {ProjectScreens} from "../../screens/project/project.types";
import {Project} from "../../screens/project/project";

/**
 * @description Tool that allows the user to shoot video clips into a card
 */
@define("shoot-tool")
export class ShootTool extends Tool {
    public constructor(document: Project) {
        super(document, ToolType.shoot);
    }

    public activate() {
        // this.documentManager.camera?.startStream();
    }

    public deactivate() {
        this.project.camera?.stopStream();
    }

    public clickAction(e: TurboEvent) {
        const closestClip = e.closest(Clip);

        //Get clicked card (if any) and shoot into it
        const closestCard = (closestClip ? closestClip.closest(Card) : e.closest(Card)) as Card;
        if (!closestCard) return;

        this.contextManager.setContext(closestCard, 1);
        if (closestClip) this.contextManager.setContext(closestClip, 2, true);
        // else this.contextManager.setContext(closestCard.timeline.clips[closestCard.timeline.clips.length - 1], 2);

        this.project.currentType = ProjectScreens.camera;
        this.project.camera.card = closestCard;
        this.project.camera.snapToClip(closestClip);
        this.project.toolPanel.changePanel(ToolType.shoot);
        this.project.camera.startStream();
    }
}
