import {
    ClickMode,
    define,
    element,
    Shown,
    StatefulReifect,
    turbo,
    TurboEventManager
} from "turbodombuilder";
import {ToolPanelContent} from "../toolPanelContent/toolPanelContent";
import "./toolPanel.css";
import {ContextEntry} from "../../managers/contextManager/contextManager.types";
import {VcComponent} from "../../components/component/component";
import {ContextManager} from "../../managers/contextManager/contextManager";
import {VcProperties} from "../../components/component/component.types";
import {Project} from "../../directors/project/project";
import {ProjectScreens} from "../../directors/project/project.types";

@define("vc-tool-panel")
export class ToolPanel extends VcComponent<any, any, any, Project> {
    private readonly panels: Map<string, Map<ProjectScreens, ToolPanelContent>> = new Map();
    private readonly contextCallbacks: ((entry: ContextEntry) => void)[] = [];

    private currentPanel: ToolPanelContent;

   public initialize() {
       super.initialize();
       turbo(this).showTransition = new StatefulReifect<Shown>({
           states: [Shown.visible, Shown.hidden],
           styles: {[Shown.hidden]: "opacity: 0", [Shown.visible]: "opacity: 1"}
       });

       TurboEventManager.instance.onToolChange.add((_old, _new, type) => {
           if (type != ClickMode.left) return;
           this.changePanel();
       });

       this.director.onScreenChange.add(() => this.changePanel());

       this.contextManager.onContextChange.add((entry: ContextEntry) => {
           this.contextCallbacks.forEach(callback => callback(entry));
       });
   }

    public get contextManager(): ContextManager {
        return this.director.contextManager;
    }

    public getPanel(tool: string, context: ProjectScreens = this.director.currentType): ToolPanelContent {
        return this.panels.get(tool)?.get(context);
    }

    public addPanel(panel: ToolPanelContent, tool: string, context?: ProjectScreens) {
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

    public changePanel(toolName: string = TurboEventManager.instance.getCurrentToolName(ClickMode.left),
                       context: ProjectScreens = this.director.currentType) {
        if (this.getPanel(toolName, context) === this.currentPanel) return;

        this.currentPanel?.detach();
        turbo(this).remChild(this.currentPanel);

        this.currentPanel = this.getPanel(toolName, context);
        if (!this.currentPanel) return;

        turbo(this).addChild(this.currentPanel);
        this.currentPanel.attach();
    }
}

export function toolPanel(properties: VcProperties<any, any, any, Project> = {}): ToolPanel {
    turbo(properties).applyDefaults({tag: "vc-tool-panel"});
    return element({...properties}) as ToolPanel;
}