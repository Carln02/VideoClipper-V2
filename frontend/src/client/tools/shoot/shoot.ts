import {VcTool} from "../tool/tool";
import {define} from "turbodombuilder";
import {ToolType} from "../../directors/project/project.types";

/**
 * @description Tool that allows the user to shoot video clips into a card
 */
@define("shoot-tool")
export class ShootTool extends VcTool<ToolType> {
    public activate() {
        // this.documentManager.camera?.startStream();
    }

    public deactivate() {
        this.director.camera?.stopStream();
    }
}