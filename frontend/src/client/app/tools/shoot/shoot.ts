import {Tool} from "../tool/tool";
import {define, TurboEvent} from "turbodombuilder";
import {Card} from "../../components/card/card";
import {Camera} from "../../views/camera/camera";
import {ContextManager} from "../../managers/contextManager/contextManager";
import {Clip} from "../../components/clip/clip";
import {ToolType} from "../../managers/toolManager/toolManager.types";
import {DocumentManager} from "../../managers/documentManager/documentManager";

/**
 * @description Tool that allows the user to shoot video clips into a card
 */
@define("shoot-tool")
export class ShootTool extends Tool {
    private readonly contextManager: ContextManager;

    public constructor(documentManager: DocumentManager) {
        super(documentManager, ToolType.shoot);
        this.contextManager = ContextManager.instance;
    }

    public activate() {
        Camera.instance?.startStream();
    }

    public deactivate() {
       Camera.instance?.stopStream();
    }

    public clickAction(e: TurboEvent) {
        const closestClip = e.closest(Clip);

        //Get clicked card (if any) and shoot into it
        const closestCard = (closestClip ? closestClip.closest(Card) : e.closest(Card)) as Card;
        if (!closestCard) return;

        this.contextManager.setContext(closestCard, 1);
        if (closestClip) this.contextManager.setContext(closestClip, 2);
        else this.contextManager.setContext(closestCard.timeline.clips[closestCard.timeline.clips.length - 1], 2);

        const camera = new Camera();
        camera.initialize(closestCard);
        camera.startStream();
    }
}
