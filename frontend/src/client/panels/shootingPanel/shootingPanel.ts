import {define} from "turbodombuilder";
import "./shootingPanel.css";
import {ToolPanelContent} from "../toolPanelContent/toolPanelContent";
import {ShootingPanelView} from "./shootingPanel.view";
import {ShootingPanelModel} from "./shootingPanel.model";
import {Camera} from "../../screens/camera/camera";
import {ToolPanelContentProperties} from "../toolPanelContent/toolPanelContent.types";
import {ToolType} from "../../directors/project/project.types";

@define()
export class ShootingPanel extends ToolPanelContent<ToolType, ShootingPanelView, object, ShootingPanelModel> {
    public constructor(properties: ToolPanelContentProperties<ToolType, ShootingPanelView, object, ShootingPanelModel>) {
        super(properties);
        this.mvc.generate({
            modelConstructor: ShootingPanelModel,
            viewConstructor: ShootingPanelView
        });
    }

    public attach() {}
    public detach() {}

    public get camera(): Camera {
        return this.director.camera;
    }
}
