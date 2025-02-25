import {SidePanel} from "../../sidePanel";
import "./textSidePanel.css";
import {SyncedText} from "../../../textElement/textElement.types";
import {ContextEntry} from "../../../../managers/contextManager/contextManager.types";
import {TextElement} from "../../../textElement/textElement";
import {SidePanelInstance} from "../../sidePanel.types";
import {ContextManager} from "../../../../managers/contextManager/contextManager";
import {TextSidePanelModel} from "./textSidePanel.model";
import {TextSidePanelView} from "./textSidePanel.view";
import {define, TurboElement} from "turbodombuilder";

@define()
export class TextSidePanel extends TurboElement<TextSidePanelView, SyncedText, TextSidePanelModel> implements SidePanelInstance {
    public readonly sidePanel: SidePanel;

    constructor(sidePanel: SidePanel) {
        super();
        this.sidePanel = sidePanel;
    }

    public attach() {
        ContextManager.instance.onContextChange.add(this.updateDataFromContext);
        const data = ContextManager.instance.getOfType(TextElement)?.data;
        if (data) this.model.data = data;
    }

    public detach() {
        ContextManager.instance.onContextChange.remove(this.updateDataFromContext);
    }

    private updateDataFromContext(entry: ContextEntry) {
        if (entry.level != 3) return;
        if (!(entry.element instanceof TextElement)) return;
        if (entry.changed == "added") return this.model.data = entry.element.data;
        this.model.clear();
        this.model.data = undefined;
    }
}