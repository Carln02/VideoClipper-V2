import {TurboInteractor} from "turbodombuilder";
import {ProjectScreens, ToolType} from "../../directors/project/project.types";
import {Card} from "./card";
import {CardView} from "./card.view";
import {CardModel} from "./card.model";

export class CardShootingInteractor extends TurboInteractor<ToolType, Card, CardView, CardModel> {
    public tool = ToolType.shoot;

    public clickStart() {
        this.element.director.contextManager.setContext(this.element, 1);
    }

    public click() {
        this.element.director.currentType = ProjectScreens.camera;
        this.element.director.camera.card = this.element;
        // this.element.director.toolPanel.changePanel(ToolType.shoot);
        this.element.director.camera.startStream();

        const url = new URL(window.location.href);
        url.searchParams.set("card", this.element.dataId);
        history.pushState(null, "", url.toString());
    }
}