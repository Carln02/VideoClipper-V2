import {MetadataDrawer} from "./metadataDrawer";
import {MetadataDrawerModel} from "./metadataDrawer.model";
import {div, turbo, turboInput, TurboInput, TurboSelect, TurboView} from "turbodombuilder";
import {
    animatedContentSwitch,
    AnimatedContentSwitchingDiv
} from "../animationComponents/animatedContentSwitchingDiv/animatedContentSwitchingDiv";

export class MetadataDrawerView extends TurboView<MetadataDrawer, MetadataDrawerModel> {
    private readonly metadataInputs: Record<string, TurboInput<"input" | "textarea">> = {};

    private tabbedMenu: HTMLElement;
    private tabbedMenuSelector: TurboSelect;

    private animationDiv: AnimatedContentSwitchingDiv;
    private metadataPanel: HTMLElement;
    private instructionsPanel: HTMLElement;

    protected setupUIElements() {
        super.setupUIElements();

        this.tabbedMenu = div({classes: "tabbed-menu"});
        this.tabbedMenuSelector = new TurboSelect({
            parent: this.tabbedMenu,
            selectedEntryClasses: "selected-tab",
            values: ["Metadata", "Instructions"],
            onSelect: (value, entry: HTMLElement) => {
                if (value) this.animationDiv.selector.select(this.tabbedMenuSelector.getValue(entry));
            }
        });

        this.metadataPanel = div({classes: "metadata-panel", ["data-value"]: "Metadata"});
        this.instructionsPanel = div({classes: "instructions-panel", ["data-value"]: "Instructions"});

        this.animationDiv = animatedContentSwitch({});
        this.animationDiv.selector.entries = this.animationDiv.children;
        this.animationDiv.selector.getValue = (entry: HTMLElement) => entry["data-value"];

        this.metadataInputs["instructions"] = turboInput({
            dynamicVerticalResize: true,
            inputTag: "textarea",
            input: {placeholder: "Add instructions..."},
            style: "align-items: flex-start",
            onInput: () => this.element.refresh()
        });

        this.metadataInputs["created"] = turboInput({
            label: "Created on",
            locked: true,
            input: {value: "01/01/2024"}
        });

        this.metadataInputs["lastModified"] = turboInput({
            label: "Last modified",
            locked: true,
            input: {value: "01/07/2024"}
        });

        this.metadataInputs["author"] = turboInput({
            label: "Author",
            input: {value: "Someone"}
        });

        this.metadataInputs["description"] = turboInput({
            label: "Description",
            dynamicVerticalResize: true,
            style: "flex-direction: column; align-items: flex-start",
            input: {tag: "textarea", placeholder: "Add a description..."},
            onInput: () => this.element.refresh()
        });
    }

    protected setupUILayout() {
        super.setupUILayout();

        turbo(this).addChild([this.tabbedMenu, this.animationDiv]);
        turbo(this.animationDiv).addChild([this.metadataPanel, this.instructionsPanel]);

        turbo(this.metadataPanel).addChild([
            this.metadataInputs["created"],
            this.metadataInputs["lastModified"],
            this.metadataInputs["author"],
            div({classes: "separator"}),
            this.metadataInputs["description"]
        ]);
        turbo(this.instructionsPanel).addChild(this.metadataInputs["instructions"]);
    }
}