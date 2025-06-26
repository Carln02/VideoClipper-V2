import {TurboInteractor} from "turbodombuilder";
import {ToolType} from "./project.types";
import {Project} from "./project";
import {ProjectModel} from "./project.model";
import {ProjectView} from "./project.view";

export class ProjectSelectionInteractor extends TurboInteractor<ToolType, Project, ProjectView, ProjectModel> {
    public tool = ToolType.selection;

    public clickStart() {
        this.element.contextManager.clearContext();
    }
}