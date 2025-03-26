import {TurboElement, TurboModel, TurboView} from "turbodombuilder";
import {ToolPanelContentProperties} from "./toolPanelContent.types";
import {ToolPanel} from "../toolPanel/toolPanel";

export class ToolPanelContent<
    ViewType extends TurboView = TurboView,
    DataType extends object = object,
    ModelType extends TurboModel = TurboModel
> extends TurboElement<ViewType, DataType, ModelType> {
    public readonly toolPanel: ToolPanel;

    public constructor(properties: ToolPanelContentProperties<ViewType, DataType, ModelType>) {
        super(properties);
        this.toolPanel = properties.toolPanel;
    }

    public attach(): void {}
    public detach(): void {}
}