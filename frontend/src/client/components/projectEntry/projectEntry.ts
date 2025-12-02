import {define, element, turbo} from "turbodombuilder";
import {ProjectEntryView} from "./projectEntry.view";
import {ProjectEntryModel} from "./projectEntry.model";
import {ProjectEntryData, ProjectEntryProperties} from "./projectEntry.types";
import "./projectEntry.css";
import {App} from "../../directors/app/app";
import {VcComponent} from "../component/component";

@define("vc-project-entry")
export class ProjectEntry extends VcComponent<ProjectEntryView, ProjectEntryData, ProjectEntryModel, App> {
    public openProject() {
        window.location.href = `${window.location.origin}/project/${this.model.projectId}`;
    }
}

export function projectEntry(properties: ProjectEntryProperties): ProjectEntry {
    turbo(properties).applyDefaults({
        tag: "vc-project-entry",
        view: ProjectEntryView,
        model: ProjectEntryModel
    });
    return element({...properties}) as ProjectEntry;
}