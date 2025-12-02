import {define, element, turbo, TurboModel, TurboView} from "turbodombuilder";
import {ToolPanel} from "../toolPanel/toolPanel";
import {ContextManager} from "../../managers/contextManager/contextManager";
import {VcComponent} from "../../components/component/component";
import {Project} from "../../directors/project/project";
import {VcProperties} from "../../components/component/component.types";

@define("vc-tool-panel-content")
export class ToolPanelContent<
    ViewType extends TurboView = TurboView<any, any>,
    DataType extends object = object,
    ModelType extends TurboModel = TurboModel
> extends VcComponent<ViewType, DataType, ModelType, Project> {
    public toolPanel: ToolPanel;

    public get contextManager(): ContextManager {
        return this.toolPanel.contextManager;
    }

    public attach(): void {}
    public detach(): void {}
}

export function toolPanelContent<
    ViewType extends TurboView = TurboView<any, any>,
    DataType extends object = object,
    ModelType extends TurboModel = TurboModel
>(properties: VcProperties<ViewType, DataType, ModelType, Project>): ToolPanelContent<ViewType, DataType, ModelType> {
    turbo(properties).applyDefaults({tag: "vc-tool-panel-content"});
    return element({...properties}) as ToolPanelContent<ViewType, DataType, ModelType>;
}