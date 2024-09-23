import {Tool} from "../tool/tool";
import {define, Point, TurboEvent} from "turbodombuilder";
import {Card} from "../../components/card/card";
import {TextType} from "../../components/textElement/textElement.types";
import {ToolType} from "../../managers/toolManager/toolManager.types";
import {Timeline} from "../../components/timeline/timeline";
import {Clip} from "../../components/clip/clip";
import {TextElement} from "../../components/textElement/textElement";

/**
 * @description Tool that creates cards
 */
@define("create-card-tool")
export class CreateCardTool extends Tool {
    constructor() {
        super(ToolType.createCard);
    }

    //On click
    public clickAction(e: TurboEvent) {
        //If there's already a card at click position --> return
        if (e.closest(Card)) return;
        if (e.closest(Timeline, false)) return;
        //Otherwise --> create card at click position

        this.createCard(e.scaledPosition);
    }

    private async createCard(position: Point) {
        const cardId = await Card.create({
            origin: {x: position.x, y: position.y},
            syncedClips: [],
            metadata: {},
        });

        const clipId = Clip.create({
            startTime: 0,
            endTime: 5,
            backgroundFill: "#FFFFFF",
            content: [],
            mediaId: undefined
        }, cardId);

        TextElement.create({
            type: TextType.title,
            fontSize: 0.1,
            origin: {x: 0.5, y: 0.5}
        }, cardId, clipId);
    }
}
