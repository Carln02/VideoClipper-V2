import {Tool} from "../tool/tool";
import {define, TurboEvent} from "turbodombuilder";
import {Card} from "../../components/card/card";
import {ToolType} from "../../managers/toolManager/toolManager.types";
import {Project} from "../../screens/project/project";

/**
 * @description Tool that creates cards
 */
@define("create-card-tool")
export class CreateCardTool extends Tool {
    public constructor(project: Project) {
        super(project, ToolType.createCard);
    }

    //On click
    public clickAction(e: TurboEvent) {
        //If there's already a card at click position --> return
        if (e.closest(Card, false)) return;
        //Otherwise --> create card at click position
        this.project.createNewCard(e.scaledPosition);
    }
}
