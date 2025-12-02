import {
    $,
    DefaultEventName,
    div, dropdown, effect,
    flexCol, icon,
    img, turbo,
    TurboDropdown,
    TurboView
} from "turbodombuilder";
import {ProjectEntry} from "./projectEntry";
import {ProjectEntryModel} from "./projectEntry.model";

export class ProjectEntryView extends TurboView<ProjectEntry, ProjectEntryModel> {
    protected titleEl: HTMLElement;
    protected lastOpenedEl: HTMLElement;
    protected imageEl: HTMLImageElement;

    protected ellipsis: TurboDropdown;
    private deleteEntry: HTMLElement;

    protected setupUIElements() {
        this.titleEl = div();
        this.lastOpenedEl = div();
        this.imageEl = img({src: "assets/misc/sample-project-img.png"});

        this.deleteEntry = div({text: "Delete"});
        this.ellipsis = dropdown({
            classes: "project-ellipsis",
            selector: icon({icon: "ellipsis"}),
            entries: [this.deleteEntry]
        });
    }

    protected setupUILayout() {
        const titleBox = flexCol();
        $(titleBox).addChild([this.titleEl, this.lastOpenedEl]);
        $(this).addChild([this.imageEl, titleBox, this.ellipsis]);
    }

    protected setupUIListeners() {
        $(this).on(DefaultEventName.click, () => this.element.openProject());
        turbo(this.deleteEntry).on(DefaultEventName.click, () => {
            this.element.director.groupsHandler.deleteProject(this.model.projectId);
            $(this.element).remove();
        });
    }

    @effect updateLastOpened() {
        this.lastOpenedEl.textContent = this.model.lastOpened?.toDateString() || "";
    }

    @effect updateTitle() {
        this.titleEl.textContent = this.model.projectName;
    }
}