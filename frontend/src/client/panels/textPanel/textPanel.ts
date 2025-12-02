import "./textPanel.css";
import {TextPanelModel} from "./textPanel.model";
import {TextPanelView} from "./textPanel.view";
import {ClickMode, define, turbo, TurboEventManager} from "turbodombuilder";
import {SyncedText} from "../../components/textElement/textElement.types";
import {toolPanelContent, ToolPanelContent} from "../toolPanelContent/toolPanelContent";
import {TextElement} from "../../components/textElement/textElement";
import {ContextEntry} from "../../managers/contextManager/contextManager.types";
import {ToolPanelContentProperties} from "../toolPanelContent/toolPanelContent.types";
import {ToolType} from "../../directors/project/project.types";

@define()
export class TextPanel extends ToolPanelContent<TextPanelView, SyncedText, TextPanelModel> {
    public attach() {
        this.contextManager.onContextChange.add(this.updateDataFromContext);
        this.toolPanel.addContextCallback(this.onContextChange);
        const data = this.contextManager.getOfType(TextElement)?.data;
        if (data) this.model.data = data;
    }

    public detach() {
        this.contextManager.onContextChange.remove(this.updateDataFromContext);
        this.toolPanel.removeContextCallback(this.onContextChange);
    }

    private updateDataFromContext(entry: ContextEntry) {
        if (entry.level != 3) return;
        if (!(entry.element instanceof TextElement)) return;
        if (entry.changed == "added") return this.model.data = entry.element.data;
        this.model.clear();
        this.model.data = undefined;
    }

    private onContextChange = (entry: ContextEntry) => {
        if (entry.element instanceof TextElement) {
            if (entry.changed == "added") this.toolPanel.changePanel(ToolType.createText);
            else this.toolPanel.changePanel(TurboEventManager.instance.getCurrentToolName(ClickMode.left));
        }
    }
}

export function textPanel(properties: ToolPanelContentProperties<TextPanelView, SyncedText, TextPanelModel>): TextPanel {
    turbo(properties).applyDefaults({tag: "vx-text-panel", view: TextPanelView, model: TextPanelModel});
    return toolPanelContent({...properties}) as TextPanel;
}