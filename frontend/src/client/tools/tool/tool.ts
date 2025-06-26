import "./tool.css";
import {auto, define, Tool} from "turbodombuilder";
import {Project} from "../../directors/project/project";
import {ContextManager} from "../../managers/contextManager/contextManager";
import {CursorManager} from "../../managers/cursorManager/cursorManager";
import {VcToolProperties} from "./tool.types";

/**
 * @description General Tool class that defines basic behaviors and "abstract" functions tools could use to handle events
 */
@define()
export class VcTool<ToolType = string> extends Tool<ToolType> {
    public readonly director: Project;

    public constructor(properties: VcToolProperties<ToolType>) {
        super(properties);
        this.director = properties.director;
        this.addClass("vc-tool");
    }

    public get contextManager(): ContextManager {
        return this.director.contextManager;
    }

    public get cursorManager(): CursorManager {
        return this.director.cursorManager;
    }
}