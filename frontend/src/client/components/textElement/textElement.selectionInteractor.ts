import {DefaultEventName, TurboDragEvent, TurboInteractor} from "turbodombuilder";
import {ToolType} from "../../directors/project/project.types";
import {TextElement} from "./textElement";
import {TextElementView} from "./textElement.view";
import {TextElementModel} from "./textElement.model";

export class TextElementSelectionInteractor extends TurboInteractor<ToolType, TextElement, TextElementView, TextElementModel> {
    public tool = ToolType.selection;
    public propagateUp = {
        [DefaultEventName.clickStart]: true
    };

    public clickStart() {
        this.element.director.contextManager.setContext(this.element, 3, true);
    }

    public drag(e: TurboDragEvent) {
        e.stopImmediatePropagation();
        // this.element.translateBy(e.scaledDeltaPosition);
        this.element.director.contextManager.getAllOfType(TextElement).forEach(entry => {
            if (!(entry instanceof TextElement)) return;
            entry.translateBy(e.scaledDeltaPosition);
        });
    }
}