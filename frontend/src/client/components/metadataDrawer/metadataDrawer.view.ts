import {MetadataDrawer} from "./metadataDrawer";
import {MetadataDrawerModel} from "./metadataDrawer.model";
import {div, TurboInput, TurboSelect, TurboSelectEntry, TurboView} from "turbodombuilder";
import {
    AnimatedContentSwitchingDiv
} from "../animationComponents/animatedContentSwitchingDiv/animatedContentSwitchingDiv";

export class MetadataDrawerView extends TurboView<MetadataDrawer, MetadataDrawerModel> {
    private readonly metadataInputs: Record<string, TurboInput<"input" | "textarea">> = {};

    private tabbedMenu: TurboSelect;
    private animationDiv: AnimatedContentSwitchingDiv;

    private metadataPanel: TurboSelectEntry;
    private instructionsPanel: TurboSelectEntry;

    protected setupUIElements() {
        super.setupUIElements();

        this.tabbedMenu = new TurboSelect({
            values: ["Metadata", "Instructions"],
            customSelectedEntryClasses: "selected-tab",
            onSelect: (value, entry) => {
                if (value) this.animationDiv.select(entry.value);
            }
        });

        this.metadataPanel = new TurboSelectEntry({classes: "metadata-panel", value: "Metadata", element: div()});
        this.instructionsPanel = new TurboSelectEntry({classes: "instructions-panel", value: "Instructions", element: div()});

        this.animationDiv = new AnimatedContentSwitchingDiv({values: [this.metadataPanel, this.instructionsPanel]});

        this.metadataInputs["instructions"] = new TurboInput({
            dynamicVerticalResize: true,
            element: {tag: "textarea", placeholder: "Add instructions..."},
            style: "align-items: flex-start",
            onInput: () => this.element.refresh()
        });

        this.metadataInputs["created"] = new TurboInput({
            label: "Created on",
            locked: true,
            element: {tag: "input", value: "01/01/2024"}
        });

        this.metadataInputs["lastModified"] = new TurboInput({
            label: "Last modified",
            locked: true,
            element: {tag: "input", value: "01/07/2024"}
        });

        this.metadataInputs["author"] = new TurboInput({
            label: "Author",
            element: {tag: "input", value: "Someone"}
        });

        this.metadataInputs["description"] = new TurboInput({
            label: "Description",
            dynamicVerticalResize: true,
            style: "flex-direction: column; align-items: flex-start",
            element: {tag: "textarea", placeholder: "Add a description..."},
            onInput: () => this.element.refresh()
        });
    }

    protected setupUILayout() {
        super.setupUILayout();

        this.element.addChild([this.tabbedMenu, this.animationDiv]);
        this.metadataPanel.addChild([
            this.metadataInputs["created"],
            this.metadataInputs["lastModified"],
            this.metadataInputs["author"],
            div({classes: "separator"}),
            this.metadataInputs["description"]
        ]);
        this.instructionsPanel.addChild(this.metadataInputs["instructions"]);
    }

    public initialize() {
        super.initialize();
        this.tabbedMenu.select("Metadata");
    }
}