import {Cursor} from "../../managers/cursorManager/cursorManager.types";
import {ToolType} from "../../directors/project/project.types";
import {ClickMode, TurboDragEvent, TurboEvent, TurboTool} from "turbodombuilder";
import {Tool} from "../../components/tool/tool";
import {Project} from "../../directors/project/project";

/**
 * @description Tool that allows the user to pan the canvas
 */
export class NavigatorTool extends TurboTool<Tool> {
    public toolName = ToolType.navigator;

    public onActivate() {
        //Set cursor to grab
        this.element.cursorManager.cursor = Cursor.grab;
    }

    public onDeactivate() {
        //Deactivation --> cursor default
        this.element.cursorManager.cursor = Cursor.default;
    }

    public clickStart(_, target: Node) {
        if (target instanceof Project) {
            //Click start --> cursor grabbing
            this.element.cursorManager.cursor = Cursor.grabbing;
            return true;
        }

    }

    public drag(e: TurboDragEvent, target: Node) {
        if (target instanceof Project) {
            //On drag --> pan and (if two touch points) zoom
            target.canvas.navigationManager.pan(e);
            if (e.positions.valuesArray().length > 1) target.canvas.navigationManager.zoom(e);
            return true;
        }
    }

    public clickEnd(e: TurboEvent, target: Node) {
        if (target instanceof Project) {
            this.element.cursorManager.cursor = e.clickMode == ClickMode.middle ? Cursor.default : Cursor.grab;
            return true;
        }
    }
}
