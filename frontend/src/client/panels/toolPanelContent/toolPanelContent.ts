import {TurboModel} from "turbodombuilder";
import {ToolPanelContentProperties} from "./toolPanelContent.types";
import {ToolPanel} from "../toolPanel/toolPanel";
import {ToolPanelContentView} from "./toolPanelContent.view";
import {ToolManager} from "../../managers/toolManager/toolManager";
import {ContextManager} from "../../managers/contextManager/contextManager";
import {VcComponent} from "../../components/component/component";
import "./toolPanelContent.css";
import {Project} from "../../directors/project/project";

export class ToolPanelContent<
    ViewType extends ToolPanelContentView = ToolPanelContentView<any, any>,
    DataType extends object = object,
    ModelType extends TurboModel = TurboModel
> extends VcComponent<ViewType, DataType, ModelType, Project> {
    public readonly toolPanel: ToolPanel;

    public constructor(properties: ToolPanelContentProperties<ViewType, DataType, ModelType>) {
        super(properties);
        this.toolPanel = properties.toolPanel;
        this.addClass("tool-panel-content");
    }

    public get toolManager(): ToolManager {
        return this.toolPanel.toolManager;
    }

    public get contextManager(): ContextManager {
        return this.toolPanel.contextManager;
    }

    public attach(): void {}
    public detach(): void {}
}