import {div, icon, TurboIcon, TurboModel, TurboView} from "turbodombuilder";
import {ToolPanelContent} from "./toolPanelContent";

export class ToolPanelContentView<
    ElementType extends ToolPanelContent = ToolPanelContent,
    ModelType extends TurboModel = TurboModel
> extends TurboView<ElementType, ModelType> {
    protected cancelButton: TurboIcon;
    protected saveButton: TurboIcon;
    protected backButton: TurboIcon;

//     requestAnimationFrame(() => {
//     this._panelMarginTop = buttons.offsetHeight + 32;
// });

    protected setupUIElements() {
        super.setupUIElements();

        this.backButton = icon({icon: "arrow-right"});
        this.saveButton = icon({icon: "save"});
        this.cancelButton = icon({icon: "cancel"});
    }

    protected setupUILayout() {
        super.setupUILayout();

        this.element.addChild(
            div({
                classes: "main-buttons-div",
                children: [this.cancelButton, this.saveButton, this.backButton]
            })
        );
    }
}