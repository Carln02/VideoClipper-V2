import {TurboEvent, TurboInteractor} from "turbodombuilder";
import {ToolType} from "./project.types";
import {Project} from "./project";
import {ProjectView} from "./project.view";
import {ProjectModel} from "./project.model";

export class ProjectCreateCardInteractor extends TurboInteractor<ToolType, Project, ProjectView, ProjectModel> {
    public tool = ToolType.createCard;

    public click(e: TurboEvent) {
        this.element.createNewCard(e.scaledPosition);
    }
}