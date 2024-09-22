import {Tool} from "../tool/tool";
import {define, Point, TurboEvent} from "turbodombuilder";
import {Card} from "../../components/card/card";
import {TextType} from "../../components/textElement/textElement.types";
import {ToolType} from "../../managers/toolManager/toolManager.types";
import {Timeline} from "../../components/timeline/timeline";
import {Clip} from "../../components/clip/clip";
import {TextElement} from "../../components/textElement/textElement";
import {SyncedClip} from "../../components/clip/clip.types";
import {SyncedCardMetadata} from "../../components/metadataDrawer/metadataDrawer.types";
import {SyncedType} from "../../abstract/syncedComponent/syncedComponent.types";
import {proxied, YCoordinate, YProxiedArray} from "../../../../yProxy/yProxy";

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
        const cardId = await Card.create(proxied({
            origin: {x: position.x, y: position.y} as YCoordinate,
            syncedClips: [] as YProxiedArray<SyncedClip>,
            metadata: {} as SyncedCardMetadata,
        }));

        // const clipId = Clip.create({
        //     startTime: 0,
        //     endTime: 5,
        //     backgroundFill: "#FFFFFF",
        //     content: []
        // }, cardId);
        //
        // TextElement.create({
        //     type: TextType.title,
        //     fontSize: 0.1,
        //     origin: {x: 0.5, y: 0.5}
        // }, cardId, clipId);
    }
}
