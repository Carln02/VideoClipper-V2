import "./backgroundSelector.css";
import {
    define,
    div,
    TurboSelect,
    TurboSelectEntry, TurboSelectEntryProperties,
    TurboSelectProperties
} from "turbodombuilder";
import {BackgroundSelectorView} from "./backgroundSelector.view";

@define("camera-background-selector")
export class BackgroundSelector extends TurboSelect<string, string, TurboSelectEntry, BackgroundSelectorView, object> {
    public constructor(properties: TurboSelectProperties<string, string, TurboSelectEntry, BackgroundSelectorView> = {}) {
        properties.values = [];
        super(properties);
        this.mvc.generate({
            viewConstructor: BackgroundSelectorView,
        });
        ["#ffffff", "#000000", "#e36060", "#607fe3", "#d1c948", "color-picker"].forEach(color => this.addEntry(color))
    }

    public get selectedValue() {
        if (super.selectedValue === "color-picker") return this.selectedEntry.element.style.borderColor;
        return super.selectedValue;
    }

    protected addEntry(entry: TurboSelectEntryProperties | string | TurboSelectEntry): TurboSelectEntry {
        if (typeof entry === "string") {
            if (entry === "color-picker") entry = super.addEntry({
                value: entry,
                element: this.createColorPickerEntryElement()
            });

            else entry = super.addEntry({
                value: entry,
                element: div({style: "background-color: " + entry})
            });

            entry.element.addClass("color-palette-entry");
            return entry;
        }
        return super.addEntry(entry);
    }

    private createColorPickerEntryElement(): HTMLDivElement {
        const element = this.view.generateColorPickerButton();
        this.view.colorPicker.addListener("input", (e) => {
            if (this.selectedEntry.element != element) return;
            element.setStyle("borderColor", e.target.value);
            this.onSelect(true, this.selectedEntry, this.getIndex(this.selectedEntry));
        });
        return element;
    }
}