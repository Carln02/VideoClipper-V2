import {ToolManager, TurboModel, TurboView} from "turbodombuilder";
import {ToolPanelContentProperties} from "./toolPanelContent.types";
import {ToolPanel} from "../toolPanel/toolPanel";
import {ContextManager} from "../../managers/contextManager/contextManager";
import {VcComponent} from "../../components/component/component";
import {Project} from "../../directors/project/project";

export class ToolPanelContent<
    ToolType = string,
    ViewType extends TurboView = TurboView<any, any>,
    DataType extends object = object,
    ModelType extends TurboModel = TurboModel
> extends VcComponent<ViewType, DataType, ModelType, Project> {
    public readonly toolPanel: ToolPanel<ToolType>;

    public constructor(properties: ToolPanelContentProperties<ToolType, ViewType, DataType, ModelType>) {
        super(properties);
        this.toolPanel = properties.toolPanel;
        this.addClass("tool-panel-content");
    }

    public get toolManager(): ToolManager<ToolType> {
        return this.toolPanel.toolManager;
    }

    public get contextManager(): ContextManager {
        return this.toolPanel.contextManager;
    }

    public attach(): void {}
    public detach(): void {}
}