import {define, h4, TurboElement} from "turbodombuilder";
import {TabbedMenuProperties} from "./tabbedMenu.types";
import "./tabbedMenu.css";

@define("tabbed-menu")
export class TabbedMenu extends TurboElement {
    private readonly entries: HTMLHeadingElement[] = [];
    private readonly action: (value: string, index: number) => void = () => {};

    private selectedEntry: HTMLHeadingElement;

    private readonly defaultSelectedValueClass: string = "";

    constructor(properties: TabbedMenuProperties) {
        super(properties);
        properties.values.forEach(value => this.addEntry(value));
        if (properties.defaultSelectedValueClass) this.defaultSelectedValueClass = properties.defaultSelectedValueClass;
        if (properties.action) this.action = properties.action;
        if (properties.selectedValue) this.select(properties.selectedValue);
    }

    public addEntry(value: string, selected?: boolean) {
        const entry = h4({
            text: value,
            parent: this,
            listeners: {
                "vc-click": () => this.select(value)
            }
        });

        if (selected) this.select(value);
        this.entries.push(entry);
    }

    public select(value: string) {
        if (this.selectedEntry && value == this.selectedEntry.innerText) return;
        const newSelectedEntry = this.entries.find(entry => entry.innerText == value);
        if (!newSelectedEntry) return;

        if (this.selectedEntry) this.selectedEntry.removeClass(this.defaultSelectedValueClass);
        this.selectedEntry = newSelectedEntry;
        this.selectedEntry.addClass(this.defaultSelectedValueClass);
        this.action(value, this.entries.indexOf(newSelectedEntry));
    }
}