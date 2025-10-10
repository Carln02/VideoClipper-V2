import {
    button,
    DefaultEventName,
    div, h2,
    TurboButton, TurboInput,
    TurboPopup,
    TurboSelect,
    TurboSelectEntry,
    TurboView
} from "turbodombuilder";
import {Home} from "./home";
import {ObjectId} from "mongodb";
import {Group, ProjectData} from "../../handlers/groupsHandler/groupsHandler.types";
import {ProjectEntry} from "../../components/projectEntry/projectEntry";

export class HomeView extends TurboView<Home> {
    private groupsPanel: HTMLElement;
    private mainPanel: HTMLElement;

    private mainPanelTitle: HTMLElement;

    private groupsSelect: TurboSelect<string, ObjectId>;
    private projectsSelect: TurboSelect<string, ObjectId, ProjectEntry>;

    private addGroupButton: TurboButton;
    private addGroupPopup: TurboPopup;
    private popupCreateGroupButton: TurboButton;
    private popupGroupNameField: TurboInput;

    private addProjectButton: TurboButton;
    private addProjectPopup: TurboPopup;
    private popupCreateButton: TurboButton;
    private popupNameField: TurboInput;

    private shareGroupButton: TurboButton;
    private shareGroupPopup: TurboPopup;
    private shareGroupPopupButton: TurboButton;
    private shareGroupPopupEmailField: TurboInput;

    public initialize() {
        super.initialize();
        this.groupsSelect?.select(this.groupsSelect.enabledEntries?.[0]);
    }

    protected setupUIElements() {
        super.setupUIElements();
        this.groupsPanel = div({id: "groups-panel"});
        this.mainPanel = div({id: "main-panel"});

        this.mainPanelTitle = h2();
        this.addProjectButton = button({text: "Add Project"});
        this.popupNameField = new TurboInput({type: "text", label: "Project Name", value: "name"});
        this.popupCreateButton = new TurboButton({text: "Create"});
        this.addProjectPopup = new TurboPopup({
            classes: "popup-card",
            viewportMargin: 20,
            offsetFromParent: 12,
            parentAnchor: {x: 100, y: 100},
            popupAnchor: {x: 0, y: 0},
        });

        this.addGroupButton = button({text: "+ Create Group"});
        this.popupGroupNameField = new TurboInput({type: "text", label: "Group Name", value: "name"});
        this.popupCreateGroupButton = new TurboButton({text: "Create"});
        this.addGroupPopup = new TurboPopup({
            classes: "popup-card",
            viewportMargin: 20,
            offsetFromParent: 12,
            parentAnchor: {x: 0, y: 100},
            popupAnchor: {x: 0, y: 0},
        });

        this.shareGroupButton = button({text: "Share"});
        this.shareGroupPopupEmailField = new TurboInput({type: "email", label: "User e-mail", value: "email"});
        this.shareGroupPopupButton = new TurboButton({text: "Share"});
        this.shareGroupPopup = new TurboPopup({
            classes: "popup-card",
            viewportMargin: 20,
            offsetFromParent: 12,
            parentAnchor: {x: 50, y: 100},
            popupAnchor: {x: 0, y: 0},
        });

        this.groupsSelect = new TurboSelect({id: "groups-select"});
        this.projectsSelect = new TurboSelect({id: "projects-select"});
    }

    protected setupUILayout() {
        super.setupUILayout();

        const groupsTitleEl = div({classes: "title-div"});
        groupsTitleEl.addChild([h2({text: "Groups"}), this.addGroupButton]);

        const titleEl = div({classes: "title-div"});
        titleEl.addChild([this.mainPanelTitle, this.shareGroupButton, this.addProjectButton]);

        this.groupsPanel.addChild([groupsTitleEl, this.groupsSelect]);
        this.mainPanel.addChild([titleEl, this.projectsSelect]);
        this.element.addChild([this.groupsPanel, this.mainPanel]);

        this.addGroupButton.addChild(this.addGroupPopup);
        this.addGroupPopup.addChild([
            this.popupGroupNameField,
            this.popupCreateGroupButton,
        ]);

        this.addProjectButton.addChild(this.addProjectPopup);
        this.addProjectPopup.addChild([
            this.popupNameField,
            this.popupCreateButton,
        ]);

        this.shareGroupButton.addChild(this.shareGroupPopup);
        this.shareGroupPopup.addChild([
            this.shareGroupPopupEmailField,
            this.shareGroupPopupButton,
        ]);
    }

    protected setupUIListeners() {
        super.setupUIListeners();
        this.addProjectButton.addListener(DefaultEventName.click, async () => {
            this.popupNameField.value = "";
            this.addProjectPopup.show(true);
        });

        this.addGroupButton.addListener(DefaultEventName.click, async () => {
            this.popupGroupNameField.value = "";
            this.addGroupPopup.show(true);
        });

        this.shareGroupButton.addListener(DefaultEventName.click, async () => {
            this.shareGroupPopupEmailField.value = "";
            this.shareGroupPopup.show(true);
        });

        this.popupNameField.addListener(DefaultEventName.click, () => this.popupNameField.inputElement.focus());
        this.popupGroupNameField.addListener(DefaultEventName.click, () => this.popupGroupNameField.inputElement.focus());
        this.shareGroupPopupEmailField.addListener(DefaultEventName.click, () => this.shareGroupPopupEmailField.inputElement.focus());

        this.popupCreateButton.addListener(DefaultEventName.click, async () => {
            const name = this.popupNameField.value as string;
            if (!name || name.length === 0) return;
            const project = await this.element.director.groupsHandler.createProject(name, this.groupsSelect.selectedSecondaryValue);
            const entry = new ProjectEntry({
                title: project.name,
                projectId: project._id,
                director: this.element.director
            });
            this.projectsSelect.addEntry(entry);
            entry.openProject();
        });

        this.popupCreateGroupButton.addListener(DefaultEventName.click, async () => {
            const name = this.popupGroupNameField.value as string;
            if (!name || name.length === 0) return;
            const group = await this.element.director.groupsHandler.createGroup(name);
            this.groupsSelect.select(this.generateGroup(group));
            this.addGroupPopup.show(false);
        });

        this.shareGroupPopupButton.addListener(DefaultEventName.click, async () => {
            const email = this.shareGroupPopupEmailField.value as string;
            if (!email || email.length === 0) return;
            const addMember = await this.element.director.groupsHandler.addGroupMember(email, this.groupsSelect.selectedSecondaryValue);
            if (addMember) this.addGroupPopup.show(false);
            else this.shareGroupPopupEmailField.value = "";
        });
    }

    public generateGroups = (groups: Group[]) => {
        this.groupsSelect.clear();
        this.generateGroup();
        groups.forEach((group: Group) => this.generateGroup(group));
    };

    private generateGroup(group?: Group) {
        if (!group) group = {
            _id: null,
            name: "All Projects",
            createdAt: undefined,
            members: [],
            ownerId: undefined,
        };

        const entry = new TurboSelectEntry({value: group.name, secondaryValue: group._id});
        this.groupsSelect.addEntry(entry);
        entry.onSelected = (value) => {
            if (value) {
                this.mainPanelTitle.textContent = group.name;
                this.generateProjects(group._id);
            }
            this.shareGroupButton.show(group._id && !(group.name === "My Projects" && group.members.length === 1));
            this.addProjectButton.show(!!group._id);
        };

        if (!group._id) this.groupsSelect.select(entry);
        return entry;
    }

    public async generateProjects(groupId: ObjectId) {
        this.projectsSelect.clear();
        this.projectsSelect.removeAllChildren();

        const projects = await this.element.director.groupsHandler.getProjectsForGroup(groupId);
        projects.forEach((project: ProjectData) => this.projectsSelect.addEntry(
            new ProjectEntry({title: project.name, projectId: project._id, director: this.element.director})
        ));
        this.projectsSelect.addChild([div(), div(), div(), div()])
    }


}