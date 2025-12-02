import {define, turbo} from "turbodombuilder";
import "./shootingPanel.css";
import {toolPanelContent, ToolPanelContent} from "../toolPanelContent/toolPanelContent";
import {ShootingPanelView} from "./shootingPanel.view";
import {ShootingPanelModel} from "./shootingPanel.model";
import {Camera} from "../../screens/camera/camera";
import {ToolPanelContentProperties} from "../toolPanelContent/toolPanelContent.types";
import {Card} from "../../components/card/card";

@define("vc-shooting-panel")
export class ShootingPanel extends ToolPanelContent<ShootingPanelView, object, ShootingPanelModel> {
    public attach() {}
    public detach() {}

    public get camera(): Camera {
        return this.director.camera;
    }

    public get card(): Card {
        return this.camera.card;
    }

    public refresh() {
        this.view.refresh();
    }
}

export function shootingPanel(properties: ToolPanelContentProperties<ShootingPanelView, object, ShootingPanelModel>): ShootingPanel {
    turbo(properties).applyDefaults({tag: "vc-shooting-panel", view: ShootingPanelView, model: ShootingPanelModel});
    return toolPanelContent({...properties}) as ShootingPanel;
}