import {VcComponent} from "../../components/component/component";
import {define, Delegate, element, turbo} from "turbodombuilder";
import {VcProperties} from "../../components/component/component.types";
import {ProjectsPanelView} from "./projectsPanel.view";
import {App} from "../../directors/app/app";
import {Group} from "../../handlers/groupsHandler/groupsHandler.types";
import {ObjectId} from "mongodb";
import "./projectsPanel.css";

@define("vc-projects-panel")
export class ProjectsPanel extends VcComponent<ProjectsPanelView, any, any, App> {
    public onCreateProject: Delegate<(projectName: string) => void> = new Delegate();
    public onAddGroupMember: Delegate<(email: string) => void> = new Delegate();

    public changeGroup(group: Group) {
        return this.view.changeGroup(group);
    }

    public createProject(projectName: string, groupId: ObjectId) {
        return this.view.createProject(projectName, groupId);
    }

    public addGroupMember(email: string, groupId: ObjectId) {
        return this.view.addGroupMember(email, groupId);
    }
}

export function projectsPanel(properties: VcProperties<ProjectsPanelView, any, any, App> = {}): ProjectsPanel {
    turbo(properties).applyDefaults({tag: "vc-projects-panel", view: ProjectsPanelView});
    return element({...properties}) as ProjectsPanel;
}