import {css, DefaultEventName, div, h3, icon, input, TurboView} from "turbodombuilder";
import {BackgroundSelector} from "./backgroundSelector";

export class BackgroundSelectorView extends TurboView<BackgroundSelector> {
    private title: HTMLElement;
    private palette: HTMLElement;

    public colorPicker: HTMLInputElement;

    protected setupUIElements() {
        super.setupUIElements();

        this.title = h3({text: "Background"});
        this.palette = div({classes: "color-palette"});

        this.colorPicker = input({type: "color", value: "#FFFFFF",
            style: css`visibility: hidden; height: 0; width: 0`});
    }

    protected setupUILayout() {
        super.setupUILayout();
        this.element.addChild([this.title, this.palette, this.colorPicker]);
        this.palette.addChild(this.element.entries);
    }

    public generateColorPickerButton(): HTMLDivElement {
        return div({
            classes: "color-picker",
            children: [icon({icon: "pen", iconColor: "white"})],
            style: "border-color: #FFFFFF"
        }).addListener(DefaultEventName.click, () => {
            this.colorPicker.click();
        });
    }
}