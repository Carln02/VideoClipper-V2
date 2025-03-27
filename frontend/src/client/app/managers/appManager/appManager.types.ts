import {CursorManager} from "../cursorManager/cursorManager";
import {ToolManager} from "../toolManager/toolManager";
import {ContextManager} from "../contextManager/contextManager";
import {TurboEventManager} from "turbodombuilder";

export type AppManagerProperties = {
    eventManager: TurboEventManager,
    contextManager: ContextManager,
    toolManager: ToolManager,
    cursorManager: CursorManager
}