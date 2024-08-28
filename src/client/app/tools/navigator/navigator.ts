import {Tool} from "../tool/tool";
import {Canvas} from "../../views/canvas/canvas";
import {NavigationManager} from "../../views/canvas/managers/navigationManager/navigationManager";
import {ClickMode, define, TurboDragEvent, TurboEvent} from "turbodombuilder";
import {Cursor} from "../../managers/cursorManager/cursorManager.types";
import {CursorManager} from "../../managers/cursorManager/cursorManager";
import {ToolType} from "../../managers/toolManager/toolManager.types";

/**
 * @description Tool that allows the user to pan the canvas
 */
@define("navigator-tool")
export class NavigatorTool extends Tool {
    constructor() {
        super(ToolType.navigator);
    }

    private get navigationManager(): NavigationManager {
        return Canvas.instance.navigationManager;
    }

    private get cursorManager(): CursorManager {
        return CursorManager.instance;
    }

    public activate() {
        //Set cursor to grab
        this.cursorManager.cursor = Cursor.grab;
    }

    public clickStart(e: TurboEvent) {
        //Click start --> cursor grabbing
        this.cursorManager.cursor = Cursor.grabbing;
    }

    public dragAction(e: TurboDragEvent) {
        //On drag --> pan and (if two touch points) zoom
        this.navigationManager.pan(e);
        if (e.positions.valuesArray().length > 1) this.navigationManager.zoom(e);
    }

    public clickEnd(e: TurboEvent) {
        if (e.clickMode == ClickMode.middle)  this.cursorManager.cursor = Cursor.default;
        //Click end --> cursor grab
        else this.cursorManager.cursor = Cursor.grab;
    }

    public deactivate() {
        //Deactivation --> cursor default
        this.cursorManager.cursor = Cursor.default;
    }
}