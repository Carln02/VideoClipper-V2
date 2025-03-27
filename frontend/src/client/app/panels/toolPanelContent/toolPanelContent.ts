import {TurboElement, TurboModel} from "turbodombuilder";
import {ToolPanelContentProperties} from "./toolPanelContent.types";
import {ToolPanel} from "../toolPanel/toolPanel";
import {ToolPanelContentView} from "./toolPanelContent.view";

export class ToolPanelContent<
    ViewType extends ToolPanelContentView = ToolPanelContentView<any, any>,
    DataType extends object = object,
    ModelType extends TurboModel = TurboModel
> extends TurboElement<ViewType, DataType, ModelType> {
    public readonly toolPanel: ToolPanel;

    protected constructor(properties: ToolPanelContentProperties<ViewType, DataType, ModelType>) {
        super(properties);
        this.toolPanel = properties.toolPanel;
    }

    public attach(): void {}
    public detach(): void {}
}