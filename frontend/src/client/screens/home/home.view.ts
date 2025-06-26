import {
    button,
    DefaultEventName,
    div, h3,
    TurboButton, TurboInput,
    TurboPopup,
    TurboSelect,
    TurboSelectEntry,
    TurboView
} from "turbodombuilder";
import {Home} from "./home";
import {ObjectId} from "mongodb";
import {Group, ProjectData} from "../../handlers/groupsHandler/groupsHandler.types";

export class HomeView extends TurboView<Home> {
    private groupsPanel: HTMLElement;
    private mainPanel: HTMLElement;

    private groupsSelect: TurboSelect<string, ObjectId>;
    private projectsSelect: TurboSelect<string, ObjectId>;

    private addProjectButton: TurboButton;
    private addProjectPopup: TurboPopup;

    private popupCreateButton: TurboButton;
    private popupNameField: TurboInput;

    private openProject = (project: ProjectData) =>
        window.location.href = `${window.location.origin}/project/${project._id}`;

    public initialize() {
        super.initialize();
        this.groupsSelect?.select(this.groupsSelect.enabledEntries?.[0]);
    }

    protected setupUIElements() {
        super.setupUIElements();
        this.groupsSelect = new TurboSelect({id: "groups-select"});
        this.projectsSelect = new TurboSelect({});

        this.groupsPanel = div({id: "groups-panel"});
        this.mainPanel = div();

        this.addProjectButton = button({text: "Add Project"});

        this.addProjectPopup = new TurboPopup({classes: "popup-card"});
        this.popupNameField = new TurboInput({type: "text", label: "Project Name", value: "name"});
        this.popupCreateButton = new TurboButton({text: "Create"});
    }

    protected setupUILayout() {
        super.setupUILayout();
        this.groupsPanel.addChild(this.groupsSelect);
        this.mainPanel.addChild([this.addProjectButton, this.projectsSelect]);

        this.element.addChild([this.groupsPanel, this.mainPanel]);

        this.addProjectButton.addChild(this.addProjectPopup);
        this.addProjectPopup.addChild([
            this.popupNameField,
            this.popupCreateButton,
        ]);
    }

    protected setupUIListeners() {
        super.setupUIListeners();
        this.addProjectButton.addListener(DefaultEventName.click, async () => this.addProjectPopup.show(true));

        this.popupNameField.addListener(DefaultEventName.click, () => this.popupNameField.inputElement.focus());

        this.popupCreateButton.addListener(DefaultEventName.click, async () => {
            const name = this.popupNameField.value as string;
            if (!name || name.length === 0) return;
            const project = await this.element.director.groupsHandler.createProject(name, this.groupsSelect.selectedSecondaryValue);
            this.openProject(project);
        });
    }

    public generateGroups = (groups: Group[]) => {
        this.groupsSelect.clear();
        let myProjectsId = null;

        groups.forEach((group: Group) => {
            if (group.name === "My Projects" && group.members.length < 2) myProjectsId = group.name;
            const entry = new TurboSelectEntry({value: group.name, secondaryValue: group._id});
            entry.onSelected = (value) => {
                console.log(value);
                if (value) this.generateProjects(group._id);
            }
            this.groupsSelect.addEntry(entry);
        });

        this.groupsSelect.select(myProjectsId);
    };

    public async generateProjects(groupId: ObjectId) {
        this.projectsSelect.clear();
        const projects = await this.element.director.groupsHandler.getProjectsForGroup(groupId);
        projects.forEach((project: ProjectData) => {
            const entry = new TurboSelectEntry({value: project.name, secondaryValue: project._id});
            entry.addListener(DefaultEventName.click, async () => this.openProject(project));
            this.projectsSelect.addEntry(entry);
        });
    }


}