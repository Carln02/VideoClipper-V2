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
import {GroupsPanel} from "./groupsPanel";
import {Group} from "../../handlers/groupsHandler/groupsHandler.types";

export class GroupsPanelView extends TurboView<GroupsPanel> {
    public select: TurboSelect<Group>;
    private selectElement: HTMLElement;

    private addGroupButton: TurboButton;
    private addGroupPopup: TurboPopup;
    private popupCreateGroupButton: TurboButton;
    private popupGroupNameField: TurboInput;

    public initialize() {
        super.initialize();
        this.element.director.groupsHandler.onGroupsChanged.add(this.generateGroups);
        this.select.select(this.select.enabledEntries?.[0]);
    }

    protected setupUIElements() {
        super.setupUIElements();
        this.selectElement = div({id: "groups-select"});
        this.select = new TurboSelect({
            parent: this.selectElement,
            getValue: entry => entry["groupData"]
        });

        this.addGroupButton = button({text: "+ Create Group"});
        this.popupGroupNameField = turboInput({input: {type: "text", value: "name"}, label: "Group Name"});
        this.popupCreateGroupButton = button({text: "Create"});
        this.addGroupPopup = popup({
            classes: "popup-card",
            anchor: this.addGroupButton,
            viewportMargin: 20,
            offsetFromAnchor: 12,
            anchorPosition: {x: 50, y: 100},
            popupPosition: {x: 50, y: 0},
        });
    }

    protected setupUILayout() {
        super.setupUILayout();
        turbo(this).addChild([div({
            classes: "title-div", children: [
                h2({text: "Groups"}),
                this.addGroupButton
            ]
        }), this.selectElement]);

        turbo(this.addGroupPopup).addChild([
            this.popupGroupNameField,
            this.popupCreateGroupButton,
        ]);
    }

    protected setupUIListeners() {
        super.setupUIListeners();

        this.select.onSelect = (value, entry) => {
            const group = entry["groupData"];
            if (group && value) this.element.onGroupSelected.fire(group);
        }

        turbo(this.addGroupButton).on(DefaultEventName.click, () => {
            this.popupGroupNameField.value = "";
            this.addGroupPopup.show(true);
        });

        turbo(this.popupGroupNameField).on(DefaultEventName.click, () => this.popupGroupNameField.element.focus());

        turbo(this.popupCreateGroupButton).on(DefaultEventName.click, () => {
            const name = this.popupGroupNameField.value as string;
            if (!name || name.length === 0) return;
            this.element.director.groupsHandler.createGroup(name).then(group => {
                this.select.select(this.generateGroup(group));
                this.addGroupPopup.show(false);
            });
        });
    }

    public generateGroups = (groups: Group[]) => {
        this.select.clear();
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

        const entry = div({text: group.name, groupData: group});
        this.select.addEntry(entry);
        if (!group._id) this.select.select(entry);
        return entry;
    }
}