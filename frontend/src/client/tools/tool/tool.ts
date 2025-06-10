import "./tool.css";
import {ToolView} from "./toolView";
import {ToolType} from "../../managers/toolManager/toolManager.types";
import {auto, TurboDragEvent, TurboEvent} from "turbodombuilder";
import {Project} from "../../directors/project/project";
import {ContextManager} from "../../managers/contextManager/contextManager";
import {ToolManager} from "../../managers/toolManager/toolManager";
import {CursorManager} from "../../managers/cursorManager/cursorManager";

/**
 * @description General Tool class that defines basic behaviors and "abstract" functions tools could use to handle events
 */
export class Tool {
    public readonly project: Project;

    /**
     * @description The name of the tool
     */
    public readonly name: ToolType;

    //DOM elements representing this tool
    private readonly instances: ToolView[] = [];

    constructor(project: Project, name: ToolType) {
        this.name = name;
        this.project = project;
        this.selected = false;
    }

    public get contextManager(): ContextManager {
        return this.project.contextManager;
    }

    public get toolManager(): ToolManager {
        return this.project.toolManager;
    }

    public get cursorManager(): CursorManager {
        return this.project.director.cursorManager;
    }

    /**
     * @description Creates an HTML DOM element that represents this tool
     */
    public createInstance(): ToolView {
        const instance = new ToolView(this);
        this.instances.push(instance);
        return instance;
    }

    /**
     * @description Fired when the tool is picked up
     */
    public activate() {}

    /**
     * @description Fired on click start
     * @param e
     */
    public clickStart(e: TurboEvent) {}

    /**
     * @description Fired on click
     * @param e
     */
    public clickAction(e: TurboEvent) {}

    /**
     * @description Fired on click end
     * @param e
     */
    public clickEnd(e: TurboEvent) {}

    /**
     * @description Fired on pointer move
     * @param e
     */
    public moveAction(e: TurboDragEvent) {}

    /**
     * @description Fired on drag start
     * @param e
     */
    public dragStart(e: TurboDragEvent) {}

    /**
     * @description Fired on drag
     * @param e
     */
    public dragAction(e: TurboDragEvent) {}

    /**
     * @description Fired on drag end
     * @param e
     */
    public dragEnd(e: TurboDragEvent) {}

    /**
     * Fired when tool is put down (deselected)
     */
    public deactivate() {}

    /**
     * @description Marks whether the tool is selected or not. Accurately reflected on its instances
     */
    @auto()
    public set selected(value: boolean) {
        this.instances.forEach(instance => instance.update());
    }
}