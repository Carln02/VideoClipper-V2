import {
    button, DefaultEventName,
    div,
    h2, popup, turbo,
    TurboButton,
    turboInput,
    TurboInput,
    TurboPopup,
    TurboSelect,
    TurboView
} from "turbodombuilder";
import {ProjectsPanel} from "./projectsPanel";
import {ObjectId} from "mongodb";
import {projectEntry, ProjectEntry} from "../../components/projectEntry/projectEntry";
import {Group, ProjectData} from "../../handlers/groupsHandler/groupsHandler.types";

export class ProjectsPanelView extends TurboView<ProjectsPanel> {
    private title: HTMLElement;

    private selectElement: HTMLElement;
    private select: TurboSelect<string, ObjectId, ProjectEntry>;

    private addProjectButton: TurboButton;
    private addProjectPopup: TurboPopup;
    private popupCreateButton: TurboButton;
    private popupNameField: TurboInput;

    private shareGroupButton: TurboButton;
    private shareGroupPopup: TurboPopup;
    private shareGroupPopupButton: TurboButton;
    private shareGroupPopupEmailField: TurboInput;

    protected setupUIElements() {
        super.setupUIElements();

        this.title = h2();
        this.selectElement = div({id: "projects-select"});
        this.select = new TurboSelect({parent: this.selectElement});

        this.addProjectButton = button({text: "Add Project"});
        this.popupNameField = turboInput({input: {type: "text", value: "name"}, label: "Project Name"});
        this.popupCreateButton = button({text: "Create"});

        this.addProjectPopup = popup({
            classes: "popup-card",
            anchor: this.addProjectButton,
            viewportMargin: 20,
            offsetFromAnchor: 12,
            anchorPosition: {x: 50, y: 100},
            popupPosition: {x: 50, y: 0},
        });

        this.shareGroupButton = button({text: "Share"});
        this.shareGroupPopupEmailField = turboInput({input: {type: "email", value: "email"}, label: "User e-mail"});
        this.shareGroupPopupButton = button({text: "Share"});
        this.shareGroupPopup = popup({
            classes: "popup-card",
            anchor: this.shareGroupButton,
            viewportMargin: 20,
            offsetFromAnchor: 12,
            anchorPosition: {x: 50, y: 100},
            popupPosition: {x: 50, y: 0},
        });
    }

    protected setupUILayout() {
        super.setupUILayout();

        turbo(this).addChild([
            div({
                classes: "title-div",
                children: [this.title, this.shareGroupButton, this.addProjectButton]
            }),
            this.selectElement
        ]);

        // $(this.addProjectButton).addChild(this.addProjectPopup);
        turbo(this.addProjectPopup).addChild([
            this.popupNameField,
            this.popupCreateButton,
        ]);

        // $(this.shareGroupButton).addChild(this.shareGroupPopup);
        turbo(this.shareGroupPopup).addChild([
            this.shareGroupPopupEmailField,
            this.shareGroupPopupButton,
        ]);
    }

    protected setupUIListeners() {
        super.setupUIListeners();

        turbo(this.addProjectButton).on(DefaultEventName.click, () => {
            console.log(turbo(document.body).boundListeners)
            this.popupNameField.value = "";
            this.addProjectPopup.show(true);
        });

        turbo(this.shareGroupButton).on(DefaultEventName.click, () => {
            this.shareGroupPopupEmailField.value = "";
            this.shareGroupPopup.show(true);
        });

        turbo(this.popupNameField).on(DefaultEventName.click, () => this.popupNameField.element.focus());
        turbo(this.shareGroupPopupEmailField).on(DefaultEventName.click, () => this.shareGroupPopupEmailField.element.focus());

        turbo(this.popupCreateButton).on(DefaultEventName.click, () => {
            const name = this.popupNameField.value as string;
            if (!name || name.length === 0) return;
            this.element.onCreateProject.fire(name);
        });

        turbo(this.shareGroupPopupButton).on(DefaultEventName.click, () => {
            const email = this.shareGroupPopupEmailField.value as string;
            if (!email || email.length === 0) return;
            this.element.onAddGroupMember.fire(email);
        });
    }

    public async generateProjects(groupId: ObjectId) {
        this.select.clear();
        turbo(this.selectElement).removeAllChildren();

        const projects = await this.element.director.groupsHandler.getProjectsForGroup(groupId);
        projects.forEach((project: ProjectData) => this.select.addEntry(
            projectEntry({
                data: {projectId: project._id, projectName: project.name},
                director: this.element.director
            })
        ));

        turbo(this.selectElement).addChild([div(), div(), div(), div()])
    }

    public changeGroup(group: Group) {
        this.title.textContent = group.name;
        this.generateProjects(group._id);
        turbo(this.shareGroupButton).show(group._id && !(group.name === "My Projects" && group.members.length === 1));
        turbo(this.addProjectButton).show(!!group._id);
    }

    public createProject(projectName: string, groupId: ObjectId) {
        this.element.director.groupsHandler.createProject(projectName, groupId)
            .then(project => {
                const entry = projectEntry({
                    data: {projectId: project._id, projectName: project.name},
                    director: this.element.director
                });
                this.select.addEntry(entry);
                entry.openProject();
            });
    }

    public addGroupMember(email: string, groupId: ObjectId) {
        this.element.director.groupsHandler.addGroupMember(email, groupId)
            .then(addMember => {
                if (addMember) this.shareGroupPopup.show(false);
                else this.shareGroupPopupEmailField.value = "";
            });
    }
}