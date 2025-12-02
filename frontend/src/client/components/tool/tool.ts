import "./tool.css";
import {button, define, turbo, TurboButton, TurboModel, TurboView} from "turbodombuilder";
import {Project} from "../../directors/project/project";
import {ContextManager} from "../../managers/contextManager/contextManager";
import {CursorManager} from "../../managers/cursorManager/cursorManager";
import {ToolProperties} from "./tool.types";

/**
 * @description General Tool class that defines basic behaviors and "abstract" functions tools could use to handle events
 */
@define("vc-tool")
export class Tool<
    ViewType extends TurboView = TurboView,
    DataType extends object = object,
    ModelType extends TurboModel<DataType> = TurboModel
> extends TurboButton<"h4", ViewType, DataType, ModelType> {
    public readonly director: Project;

    public initialize() {
        super.initialize();
        turbo(this).addClass("clickable card");
    }

    public get contextManager(): ContextManager {
        return this.director.contextManager;
    }

    public get cursorManager(): CursorManager {
        return this.director.cursorManager;
    }
}

export function tool<
    ViewType extends TurboView = TurboView,
    DataType extends object = object,
    ModelType extends TurboModel<DataType> = TurboModel
>(properties: ToolProperties<ViewType, DataType, ModelType>): Tool<ViewType, DataType, ModelType> {
    turbo(properties).applyDefaults({tag: "vc-tool"});
    return button({...properties}) as Tool<ViewType, DataType, ModelType>;
}