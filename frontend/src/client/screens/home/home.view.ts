import {button, DefaultEventName, div, TurboButton, TurboSelect, TurboSelectEntry, TurboView} from "turbodombuilder";
import {Home} from "./home";
import {Group, ProjectData} from "../../managers/groupsManager/groupsManager.types";
import {ObjectId} from "mongodb";
import {AppScreens} from "../app/app.types";

export class HomeView extends TurboView<Home> {
    private groupsPanel: HTMLElement;
    private mainPanel: HTMLElement;

    private groupsSelect: TurboSelect<string, ObjectId>;
    private projectsSelect: TurboSelect<string, ObjectId>;

    private addProjectButton: TurboButton;

    protected setupUIElements() {
        super.setupUIElements();
        this.groupsSelect = new TurboSelect({id: "groups-select"});
        this.projectsSelect = new TurboSelect({});

        this.groupsPanel = div({id: "groups-panel"});
        this.mainPanel = div();

        this.addProjectButton = button({text: "Add Project"});
    }

    protected setupUILayout() {
        super.setupUILayout();
        this.element.addChild([this.groupsPanel, this.mainPanel]);
        this.mainPanel.addChild([this.addProjectButton, this.projectsSelect]);
    }

    protected setupUIListeners() {
        super.setupUIListeners();
        this.addProjectButton.addListener(DefaultEventName.click, async () => {
            const project = await this.element.screenManager.groupsManager.createProject("P1111", this.groupsSelect.selectedSecondaryValue);
            await this.openProject(project);
        });
    }

    public onLogin = (loggedIn: boolean) => {
        this.groupsPanel.removeAllChildren();
        if (!loggedIn) {
            this.element.screenManager.authenticationManager.renderGoogleButton(this.groupsPanel);
        } else {
            this.groupsPanel.addChild(this.groupsSelect);
            //TODO this.googleLoginParent.remove();
        }
    };

    public generateGroups = (groups: Group[]) => {
        this.groupsSelect.clear();
        groups.forEach((group: Group) => {
            const entry = new TurboSelectEntry({value: group.name, secondaryValue: group._id});
            entry.onSelected = (value) => {
                if (value) this.generateProjects(group._id);
            }
            this.groupsSelect.addEntry(entry);
        });
    };

    public async generateProjects(groupId: ObjectId) {
        this.projectsSelect.clear();
        const projects = await this.element.screenManager.groupsManager.getProjectsForGroup(groupId);
        projects.forEach((project: ProjectData) => {
            const entry = new TurboSelectEntry({value: project.name, secondaryValue: project._id});
            entry.addListener(DefaultEventName.click, async () => await this.openProject(project));
            this.projectsSelect.addEntry(entry);
        });
    }

    private async openProject(project: ProjectData) {
        const persistedDoc = await this.element.screenManager.groupsManager.openProject(project._id);

        const onConnection = () => {
            console.log("CHANGING TO DOC VIEWWW")
            this.element.screenManager.documentManager.document = persistedDoc.doc;
            this.element.screenManager.currentType = AppScreens.document;
        };

        persistedDoc.websocket.onConnect.add(onConnection);
    }
}