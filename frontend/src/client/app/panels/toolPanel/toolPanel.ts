import {ClickMode, define} from "turbodombuilder";
import {ToolType} from "../../managers/toolManager/toolManager.types";
import {ToolPanelContent} from "../toolPanelContent/toolPanelContent";
import "./toolPanel.css";
import {ContextEntry} from "../../managers/contextManager/contextManager.types";
import {VcComponent} from "../../components/component/component";
import {DocumentManager} from "../../managers/documentManager/documentManager";
import {ToolManager} from "../../managers/toolManager/toolManager";
import {ContextManager} from "../../managers/contextManager/contextManager";
import {VcComponentProperties} from "../../components/component/component.types";

@define()
export class ToolPanel extends VcComponent<any, any, any, DocumentManager> {
    private readonly panels: Map<ToolType, ToolPanelContent> = new Map();
    private readonly contextCallbacks: ((entry: ContextEntry) => void)[] = [];

    private currentPanel: ToolPanelContent;

    public constructor(properties: VcComponentProperties<any, any, any, DocumentManager> = {}) {
        super(properties);

        this.toolManager.onToolChange.add((oldTool, newTool, type) => {
            if (type != ClickMode.left) return;
            this.changePanel(newTool.name);
        });

        this.contextManager.onContextChange.add((entry: ContextEntry) => {
            this.contextCallbacks.forEach(callback => callback(entry));
        });
    }

    public get toolManager(): ToolManager {
        return this.screenManager.toolManager;
    }

    public get contextManager(): ContextManager {
        return this.screenManager.contextManager;
    }

    public getPanel(tool: ToolType): ToolPanelContent {
        return this.panels.get(tool);
    }

    public addPanel(panel: ToolPanelContent, tool: ToolType) {
        this.panels.set(tool, panel);
    }

    public addContextCallback(callback: (entry: ContextEntry) => void) {
        this.contextCallbacks.push(callback);
    }

    public removeContextCallback(callback: (entry: ContextEntry) => void) {
        const index = this.contextCallbacks.indexOf(callback);
        if (index >= 0) this.contextCallbacks.splice(index, 1);
    }

    public changePanel(toolName: ToolType) {
        this.currentPanel?.detach();
        this.removeChild(this.currentPanel);

        this.currentPanel = this.panels.get(toolName);
        if (!this.currentPanel) return;

        this.addChild(this.currentPanel);
        this.currentPanel.attach();
    }
}
