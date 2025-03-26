import "./textPanel.css";
import {TextPanelModel} from "./textPanel.model";
import {TextPanelView} from "./textPanel.view";
import {ClickMode, define} from "turbodombuilder";
import {SyncedText} from "../../components/textElement/textElement.types";
import {ToolPanelContent} from "../toolPanelContent/toolPanelContent";
import {ToolPanelContentProperties} from "../toolPanelContent/toolPanelContent.types";
import {ContextManager} from "../../managers/contextManager/contextManager";
import {TextElement} from "../../components/textElement/textElement";
import {ContextEntry} from "../../managers/contextManager/contextManager.types";
import {ToolType} from "../../managers/toolManager/toolManager.types";
import {ToolManager} from "../../managers/toolManager/toolManager";

@define()
export class TextPanel extends ToolPanelContent<TextPanelView, SyncedText, TextPanelModel> {
    constructor(properties: ToolPanelContentProperties<TextPanelView, SyncedText, TextPanelModel>) {
        super(properties);
    }

    public attach() {
        ContextManager.instance.onContextChange.add(this.updateDataFromContext);
        this.toolPanel.addContextCallback(this.onContextChange);
        const data = ContextManager.instance.getOfType(TextElement)?.data;
        if (data) this.model.data = data;
    }

    public detach() {
        ContextManager.instance.onContextChange.remove(this.updateDataFromContext);
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
            if (entry.changed == "added") this.toolPanel.changePanel(ToolType.text);
            else this.toolPanel.changePanel(ToolManager.instance.getTool(ClickMode.left).name);
        }
    }
}