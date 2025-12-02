import {VcComponent} from "../../components/component/component";
import {GroupsPanelView} from "./groupsPanel.view";
import {App} from "../../directors/app/app";
import {define, Delegate, element, turbo} from "turbodombuilder";
import {Group} from "../../handlers/groupsHandler/groupsHandler.types";
import "./groupsPanel.css";
import {VcProperties} from "../../components/component/component.types";

@define("vc-groups-panel")
export class GroupsPanel extends VcComponent<GroupsPanelView, any, any, App> {
    public onGroupSelected: Delegate<(group: Group) => void> = new Delegate();

    public get selectedGroupValue(): Group {
        return this.view.select.selectedValue;
    }
}

export function groupsPanel(properties: VcProperties<GroupsPanelView, any, any, App> = {}): GroupsPanel {
    turbo(properties).applyDefaults({tag: "vc-groups-panel", view: GroupsPanelView});
    return element({...properties}) as GroupsPanel;
}