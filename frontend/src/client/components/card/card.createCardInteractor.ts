import {TurboInteractor} from "turbodombuilder";
import {ToolType} from "../../directors/project/project.types";
import {Card} from "./card";
import {CardView} from "./card.view";
import {CardModel} from "./card.model";

export class CardCreateCardInteractor extends TurboInteractor<ToolType, Card, CardView, CardModel> {
    public tool = ToolType.createCard;
    
    public click() {
        return;
    }
}