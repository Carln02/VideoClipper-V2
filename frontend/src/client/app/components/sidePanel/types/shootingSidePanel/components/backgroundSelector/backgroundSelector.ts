import "./backgroundSelector.css";
import {css, define, div, h3, icon, input,TurboElement, TurboProperties} from "turbodombuilder";
import {ShootingSidePanel} from "../../shootingSidePanel";

@define("camera-background-selector")
export class BackgroundSelector extends TurboElement {
    private readonly defaultColors = ["#ffffff", "#000000", "#e36060", "#607fe3", "#d1c948", "color-picker"] as const;

    private readonly selectedClass = "selected" as const;

    private readonly shootingSidePanel: ShootingSidePanel;

    private _selected: HTMLElement;
    private _selectedValue: string;

    constructor(shootingSidePanel: ShootingSidePanel, properties: TurboProperties = {}) {
        super(properties);
        this.shootingSidePanel = shootingSidePanel;
        this.initUI();
    }

    public get selected() {
        return this._selected;
    }

    private set selected(value: HTMLElement) {
        this.selected?.toggleClass(this.selectedClass, false);
        this._selected = value;
        value?.toggleClass(this.selectedClass, true);

        if (value.classList.contains("color-picker")) this.selectedValue = value.style.borderColor;
        else if (value.classList.contains("image-picker")) {}
        else this.selectedValue = value.style.backgroundColor;
    }

    public get selectedValue() {
        return this._selectedValue;
    }

    private set selectedValue(value: string) {
        this._selectedValue = value;
        this.shootingSidePanel.updateCamera();
    }

    private initUI() {
        h3({text: "Background", parent: this});
        div({
            classes: "color-palette",
            children: this.defaultColors.map(entry => this.createColorSelector(entry)),
            parent: this
        });
    }

    private createColorSelector(color: string) {
        let el: HTMLElement;
        if (color == "color-picker") el = this.createColorPickerButton();
        else el = div({classes: "color-palette-entry", style: "background-color: " + color});

        if (!this.selected) this.selected = el;
        el.addEventListener("vc-click", () => this.selected = el);
        return el;
    }

    private createColorPickerButton() {
        const colorPicker = input({
            type: "color",
            parent: this,
            value: "#FFFFFF",
            style: css`visibility: hidden; height: 0; width: 0`,
            listeners: {
                "input": e => {
                    if (this.selected != el) return;
                    el.style.borderColor = e.target.value;
                    this.selectedValue = e.target.value;
                },
            }
        });

        const el = div({
            classes: "color-palette-entry color-picker",
            children: [icon({icon: "pen", iconColor: "white"}), colorPicker],
            style: "border-color: #FFFFFF",
            listeners: {
                "vc-click": () => colorPicker.click()
            }
        });

        return el;
    }
}