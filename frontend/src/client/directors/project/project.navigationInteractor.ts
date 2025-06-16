import {ClickMode, TurboDragEvent, TurboEvent, TurboInteractor} from "turbodombuilder";
import {ToolType} from "./project.types";
import {Project} from "./project";
import {ProjectView} from "./project.view";
import {ProjectModel} from "./project.model";
import {Cursor} from "../../managers/cursorManager/cursorManager.types";

export class ProjectNavigationInteractor extends TurboInteractor<ToolType, Project, ProjectView, ProjectModel> {
    public tool = ToolType.navigator;

    public clickStart() {
        //Click start --> cursor grabbing
        this.element.cursorManager.cursor = Cursor.grabbing;
    }

    public drag(e: TurboDragEvent) {
        //On drag --> pan and (if two touch points) zoom
        this.element.canvas.navigationManager.pan(e);
        if (e.positions.valuesArray().length > 1) this.element.canvas.navigationManager.zoom(e);
    }

    public clickEnd(e: TurboEvent) {
        if (e.clickMode == ClickMode.middle)  this.element.cursorManager.cursor = Cursor.default;
        //Click end --> cursor grab
        else this.element.cursorManager.cursor = Cursor.grab;
    }
}