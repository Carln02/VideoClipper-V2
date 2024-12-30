import {Tool} from "../tool/tool";
import {define, TurboEvent} from "turbodombuilder";
import {Card} from "../../components/card/card";
import {ToolType} from "../../managers/toolManager/toolManager.types";
import {Timeline} from "../../components/timeline/timeline";
import {DocumentManager} from "../../views/canvas/managers/documentManager/documentManager";

/**
 * @description Tool that creates cards
 */
@define("create-card-tool")
export class CreateCardTool extends Tool {
    public constructor(documentManager: DocumentManager) {
        super(documentManager, ToolType.createCard);
    }

    //On click
    public clickAction(e: TurboEvent) {
        //If there's already a card at click position --> return
        if (e.closest(Card)) return;
        if (e.closest(Timeline, false)) return;
        //Otherwise --> create card at click position

        this.documentManager.createNewCard(e.scaledPosition);
    }
}
