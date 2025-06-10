import {ClickMode, define, Shown, StatefulReifect} from "turbodombuilder";
import {ToolType} from "../../managers/toolManager/toolManager.types";
import {ToolPanelContent} from "../toolPanelContent/toolPanelContent";
import "./toolPanel.css";
import {ContextEntry} from "../../managers/contextManager/contextManager.types";
import {VcComponent} from "../../components/component/component";
import {ToolManager} from "../../managers/toolManager/toolManager";
import {ContextManager} from "../../managers/contextManager/contextManager";
import {VcComponentProperties} from "../../components/component/component.types";
import {Project} from "../../directors/project/project";
import { ProjectScreens } from "../../directors/project/project.types";

@define()
export class ToolPanel extends VcComponent<any, any, any, Project> {
    private readonly panels: Map<ToolType, Map<ProjectScreens, ToolPanelContent>> = new Map();
    private readonly contextCallbacks: ((entry: ContextEntry) => void)[] = [];

    private currentPanel: ToolPanelContent;

    public constructor(properties: VcComponentProperties<any, any, any, Project> = {}) {
        super(properties);

        this.showTransition = new StatefulReifect<Shown>({
            states: [Shown.visible, Shown.hidden],
            styles: {[Shown.hidden]: "opacity: 0", [Shown.visible]: "opacity: 1"}
        });

        this.toolManager.onToolChange.add((_, newTool, type) => {
            if (type != ClickMode.left) return;
            this.changePanel(newTool.name);
        });

        this.director.onScreenChange.add(() => {
            this.changePanel();
        });

        this.contextManager.onContextChange.add((entry: ContextEntry) => {
            this.contextCallbacks.forEach(callback => callback(entry));
        });
    }

    public get toolManager(): ToolManager {
        return this.director.toolManager;
    }

    public get contextManager(): ContextManager {
        return this.director.contextManager;
    }

    public getPanel(tool: ToolType, context: ProjectScreens = this.director.currentType): ToolPanelContent {
        return this.panels.get(tool)?.get(context);
    }

    public addPanel(panel: ToolPanelContent, tool: ToolType, context?: ProjectScreens) {
        if (!this.panels.has(tool)) this.panels.set(tool, new Map<ProjectScreens, ToolPanelContent>());
        const contextMap = this.panels.get(tool);

        if (context) contextMap.set(context, panel);
        else Object.values(ProjectScreens).forEach(context => contextMap.set(context, panel))
    }

    public addContextCallback(callback: (entry: ContextEntry) => void) {
        this.contextCallbacks.push(callback);
    }

    public removeContextCallback(callback: (entry: ContextEntry) => void) {
        const index = this.contextCallbacks.indexOf(callback);
        if (index >= 0) this.contextCallbacks.splice(index, 1);
    }

    public changePanel(toolName: ToolType = this.toolManager.getTool(ClickMode.left).name,
                       context: ProjectScreens = this.director.currentType) {
        this.currentPanel?.detach();
        this.removeChild(this.currentPanel);

        this.currentPanel = this.getPanel(toolName, context);
        if (!this.currentPanel) return;

        this.addChild(this.currentPanel);
        this.currentPanel.attach();
    }
}
