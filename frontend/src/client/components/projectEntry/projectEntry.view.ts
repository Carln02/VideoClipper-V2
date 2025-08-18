import {
    DefaultEventName,
    div,
    flexCol,
    img,
    TurboDropdown,
    TurboIcon,
    TurboPopup,
    TurboSelectEntry,
    TurboView
} from "turbodombuilder";
import {ProjectEntry} from "./projectEntry";
import {ProjectEntryModel} from "./projectEntry.model";
import {ObjectId} from "mongodb";

export class ProjectEntryView extends TurboView<ProjectEntry, ProjectEntryModel> {
    protected lastOpenedEl: HTMLElement;
    protected imageEl: HTMLImageElement;

    protected ellipsis: TurboDropdown;

    protected setupUIElements() {
        this.lastOpenedEl = div();
        this.imageEl = img({src: "assets/misc/sample-project-img.png"});

        this.ellipsis = new TurboDropdown({
            classes: "project-ellipsis",
            selector: new TurboIcon({icon: "ellipsis"}),
            values: [
                new TurboSelectEntry({
                    value: "Delete",
                    action: async () => {
                        await this.element.director.groupsHandler.deleteProject(this.model.projectId);
                        this.element.remove();
                    }
                })
            ]
        });
    }

    protected setupUILayout() {
        const titleBox = flexCol();
        titleBox.addChild([this.element.element, this.lastOpenedEl]);
        this.element.addChild([this.imageEl, titleBox, this.ellipsis]);
    }

    protected setupUIListeners() {
        this.element.addListener(DefaultEventName.click, async () => this.element.openProject());
    }

    protected setupChangedCallbacks() {
        this.emitter.add("lastOpened", (value: string) => this.lastOpenedEl.textContent = value);
    }
}