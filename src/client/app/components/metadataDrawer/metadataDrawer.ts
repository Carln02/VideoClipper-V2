import {SyncedCardMetadata} from "./metadataDrawer.types";
import {define, div, TurboInput} from "turbodombuilder";
import "./metadataDrawer.css";
import {SyncedComponent} from "../../abstract/syncedComponent/syncedComponent";
import {PanelThumb} from "../basicComponents/panelThumb/panelThumb";
import {TabbedMenu} from "../basicComponents/tabbedMenu/tabbedMenu";
import {
    AnimatedContentSwitchingDiv
} from "../animationComponents/animatedContentSwitchingDiv/animatedContentSwitchingDiv";
import {PanelThumbProperties} from "../basicComponents/panelThumb/panelThumb.types";
import {Card} from "../card/card";
import {getSize} from "../../../utils/size";

@define("metadata-drawer")
export class MetadataDrawer extends SyncedComponent<SyncedCardMetadata> {
    private thumb: PanelThumb;

    private tabbedMenu: TabbedMenu;
    private animationDiv: AnimatedContentSwitchingDiv;

    private metadataPanel: HTMLDivElement;
    private instructionsPanel: TurboInput<"textarea">;

    private readonly metadataInputs: Record<string, TurboInput<"input" | "textarea">> = {};

    private readonly elementToFit: HTMLElement;

    constructor(data: SyncedCardMetadata, properties: PanelThumbProperties) {
        super(properties);

        if (properties.fitSizeOf) this.elementToFit = properties.fitSizeOf;
        this.initUI(properties);

        this.data = data;
        this.setupCallbacks();
    }

    protected setupCallbacks() {

    }

    public get card() {
        return this.data.parent.getBoundObjectOfType(Card);
    }

    private initUI(properties: PanelThumbProperties) {
        this.thumb = new PanelThumb({...properties, panel: this, parent: this});

        this.tabbedMenu = new TabbedMenu({
            values: ["Metadata", "Instructions"],
            action: (value, index) => {
                this.animationDiv.switchTo(index);
                this.refresh();
            },
            defaultSelectedValueClass: "selected-tab",
            parent: this
        });

        this.metadataPanel = div({classes: "metadata-panel"});

        this.instructionsPanel = new TurboInput({
            classes: "instructions-panel",
            dynamicVerticalResize: true,
            element: {tag: "textarea", placeholder: "Add instructions..."},
            style: "align-items: flex-start",
            onInput: () => this.refresh()
        });

        this.animationDiv = new AnimatedContentSwitchingDiv({
            children: [this.metadataPanel, this.instructionsPanel],
            parent: this
        });

        this.initMetadataUI();
        this.tabbedMenu.select("Metadata");
        this.refresh();
    }

    private initMetadataUI() {
        this.addInput("Created on", new TurboInput({
            label: "Created on",
            locked: true,
            element: {tag: "input", value: "01/01/2024"}
        }));
        this.addInput("Last modified", new TurboInput({
            label: "Last modified",
            locked: true,
            element: {tag: "input", value: "01/07/2024"}
        }));
        this.addInput("author", new TurboInput({
            label: "Author",
            element: {tag: "input", value: "Someone"}
        }));

        this.metadataPanel.addChild(div({classes: "separator"}));

        this.addInput("description", new TurboInput({
            label: "Description",
            dynamicVerticalResize: true,
            style: "flex-direction: column; align-items: flex-start",
            element: {tag: "textarea", placeholder: "Add a description..."},
            onInput: () => this.refresh()
        }));
    }

    private addInput<InputTag extends "input" | "textarea">(name: string, input: TurboInput<InputTag>) {
        this.metadataInputs[name] = input;
        this.metadataPanel.addChild(input);
    }

    private refresh() {
        this.thumb.refresh();
        this.animationDiv.refresh();
        if (this.elementToFit) requestAnimationFrame(() =>
            this.elementToFit.setStyle("width", getSize(this).width + "px"));
    }
}