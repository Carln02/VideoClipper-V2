import {define} from "turbodombuilder";
import {Cursor} from "../../managers/cursorManager/cursorManager.types";
import {ToolType} from "../../directors/project/project.types";
import {VcTool} from "../tool/tool";

/**
 * @description Tool that allows the user to pan the canvas
 */
@define("navigator-tool")
export class NavigatorTool extends VcTool<ToolType> {
    public activate() {
        //Set cursor to grab
        this.cursorManager.cursor = Cursor.grab;
    }

    public deactivate() {
        //Deactivation --> cursor default
        this.cursorManager.cursor = Cursor.default;
    }
}
