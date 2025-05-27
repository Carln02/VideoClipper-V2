import {define} from "turbodombuilder";
import "./shootingPanel.css";
import {ToolPanelContent} from "../toolPanelContent/toolPanelContent";
import {ShootingPanelView} from "./shootingPanel.view";
import {ShootingPanelModel} from "./shootingPanel.model";
import {Camera} from "../../screens/camera/camera";
import {ToolPanelContentProperties} from "../toolPanelContent/toolPanelContent.types";

@define()
export class ShootingPanel extends ToolPanelContent<ShootingPanelView, object, ShootingPanelModel> {
    public constructor(properties: ToolPanelContentProperties<ShootingPanelView, object, ShootingPanelModel>) {
        super(properties);
        this.mvc.generate({
            modelConstructor: ShootingPanelModel,
            viewConstructor: ShootingPanelView
        });
    }

    public attach() {}
    public detach() {}

    public get camera(): Camera {
        return this.screenManager.camera;
    }
}
