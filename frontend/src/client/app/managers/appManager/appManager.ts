import {ContextManager} from "../contextManager/contextManager";
import {CursorManager} from "../cursorManager/cursorManager";
import {ToolManager} from "../toolManager/toolManager";
import {AppManagerProperties} from "./appManager.types";
import {TurboEventManager} from "turbodombuilder";

export class AppManager {
    public readonly eventManager: TurboEventManager;
    public readonly contextManager: ContextManager;
    public readonly toolManager: ToolManager;
    public readonly cursorManager: CursorManager;

    public constructor(properties: AppManagerProperties) {
        this.eventManager = properties.eventManager;
        this.contextManager = properties.contextManager;
        this.cursorManager = properties.cursorManager;
        this.toolManager = properties.toolManager;
    }

    public preventDefaultEvent(b: boolean) {
        this.eventManager.defaultState.preventDefaultTouch = b;
        this.eventManager.defaultState.preventDefaultMouse = b;
    }
}