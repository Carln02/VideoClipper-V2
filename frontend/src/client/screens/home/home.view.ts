import {div, TurboSelect, TurboSelectEntry, TurboView} from "turbodombuilder";
import {Home} from "./home";
import {Group} from "../../managers/groupsManager/groupsManager.types";
import {ObjectId} from "mongodb";

export class HomeView extends TurboView<Home> {
    private groupsPanel: HTMLElement;
    private mainPanel: HTMLElement;

    private groupsSelect: TurboSelect;

    protected setupUIElements() {
        super.setupUIElements();
        this.groupsSelect = new TurboSelect({});

        this.groupsPanel = div();
        this.mainPanel = div();
    }

    protected setupUILayout() {
        super.setupUILayout();
        this.element.addChild([this.groupsPanel, this.mainPanel]);
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
        groups.forEach((group: Group) => {
            const entry = new TurboSelectEntry({value: group.name});
            entry.onSelected = (value) => {
                if (value) this.generateProjects(group._id);
            }
            this.groupsSelect.addEntry(entry);
        });
    };

    public generateProjects(groupId: ObjectId) {

    }
}