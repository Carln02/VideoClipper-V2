import {turbo, TurboView} from "turbodombuilder";
import {Home} from "./home";
import {groupsPanel, GroupsPanel} from "../../panels/groupsPanel/groupsPanel";
import {projectsPanel, ProjectsPanel} from "../../panels/projectsPanel/projectsPanel";

export class HomeView extends TurboView<Home> {
    private groupsPanel: GroupsPanel;
    private projectsPanel: ProjectsPanel;

    public initialize() {
        super.initialize();
        this.groupsPanel.onGroupSelected.add(group => this.projectsPanel.changeGroup(group));
        this.projectsPanel.onCreateProject.add(projectName =>
            this.projectsPanel.createProject(projectName, this.groupsPanel.selectedGroupValue._id));
        this.projectsPanel.onAddGroupMember.add(email =>
            this.projectsPanel.addGroupMember(email, this.groupsPanel.selectedGroupValue._id));
    }

    protected setupUIElements() {
        super.setupUIElements();
        this.groupsPanel = groupsPanel({director: this.element.director});
        this.projectsPanel = projectsPanel({director: this.element.director});

    }

    protected setupUILayout() {
        super.setupUILayout();
        turbo(this).addChild([this.groupsPanel, this.projectsPanel]);
    }
}