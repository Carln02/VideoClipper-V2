import {Tool} from "../../tools/tool/tool";
import {ClickMode, Delegate, TurboDragEvent, TurboEvent, TurboEventName, TurboKeyEvent} from "turbodombuilder";
import {SetToolOptions, ToolType} from "./toolManager.types";

//TODO handle key combinations maybe? Also fix the issue with 2-finger navigation on mobile when app starts
/**
 * @description Manages (ideally) all the tools in the application
 */
export class ToolManager {
    //Singleton
    private static _instance: ToolManager | null = null;

    //All created tools
    private readonly tools: Map<ToolType, Tool>;
    //Tools mapped to keys
    private readonly mappedKeysToTool: Map<string, ToolType>;

    //Tools currently held by the user (one - or none - per each click button/mode)
    private readonly currentTools: Map<ClickMode, Tool>;

    /**
     * @description Delegate fired when a tool is changed on a certain click button/mode
     */
    public readonly onToolChange: Delegate<(oldTool: Tool, newTool: Tool, type: ClickMode) => void>;

    public constructor() {
        //Cancel construction if exists already
        if (ToolManager.instance) return ToolManager.instance;
        ToolManager.instance = this;

        //Init all maps
        this.tools = new Map<ToolType, Tool>();
        this.mappedKeysToTool = new Map<string, ToolType>();
        this.currentTools = new Map<ClickMode, Tool>();

        //Create delegate
        this.onToolChange = new Delegate<(oldTool: Tool, newTool: Tool, type: ClickMode) => void>();

        //Initialization
        this.initEvents();
    }

    /**
     * @description The singleton instance.
     */
    public static get instance() {
        return this._instance;
    }

    private static set instance(value: ToolManager) {
        this._instance = value;
    }

    //Utility callback to get the current tool based on the fired event's information
    public getFiredTool(e: TurboEvent) {
        let tool: Tool;
        //If keys are pressed --> try to get the tool assigned to key mode
        if (e.keys.length > 0) tool = this.getTool(ClickMode.key);
        //If tool still null --> get tool assigned to event's click mode
        if (!tool) tool = this.getTool(e.clickMode);
        return tool;
    }

    private initEvents() {
        //On key press --> set corresponding tool as key mode
        document.addEventListener(TurboEventName.keyPressed, (e: TurboKeyEvent) => this.setToolByKey(e.keyPressed));
        //On key release --> clear set tool on key mode
        document.addEventListener(TurboEventName.keyReleased, () =>
            this.setTool(null, ClickMode.key, {select: false}));

        //Listen for all custom events on the document and accordingly execute the corresponding function on the
        //current tool. The tool will manage its actions and what object to interact with

        document.addEventListener(TurboEventName.clickStart, (e: TurboEvent) => this.getFiredTool(e)?.clickStart(e));
        document.addEventListener(TurboEventName.click, (e: TurboEvent) => this.getFiredTool(e)?.clickAction(e));
        document.addEventListener(TurboEventName.clickEnd, (e: TurboEvent) => this.getFiredTool(e)?.clickEnd(e));

        document.addEventListener(TurboEventName.move, (e: TurboDragEvent) => this.getFiredTool(e)?.moveAction(e));

        document.addEventListener(TurboEventName.dragStart, (e: TurboDragEvent) => this.getFiredTool(e)?.dragStart(e));
        document.addEventListener(TurboEventName.drag, (e: TurboDragEvent) => this.getFiredTool(e)?.dragAction(e));
        document.addEventListener(TurboEventName.dragEnd, (e: TurboDragEvent) => this.getFiredTool(e)?.dragEnd(e));
    }

    /**
     * @description Returns the tool with the given name (or undefined)
     * @param name
     */
    public getToolByName(name: ToolType): Tool {
        return this.tools.get(name);
    }

    /**
     * @description Returns all created tools as an array
     */
    public getToolsArray() {
        return [...this.tools.values()];
    }

    /**
     * @description Adds a tool to the tools map, identified by its name. Optionally, provide a key to bind the tool to.
     * @param tool
     * @param key
     */
    public addTool(tool: Tool, key?: string) {
        this.tools.set(tool.name, tool);
        if (key) this.mappedKeysToTool.set(key, tool.name);
    }

    /**
     * @description Returns the tool currently held by the provided click mode
     * @param mode
     */
    public getTool(mode: ClickMode) {
        return this.currentTools.get(mode);
    }

    /**
     * @description Sets the provided tool as a current tool associated with the provided type
     * @param tool
     * @param type
     * @param options
     */
    public setTool(tool: Tool, type: ClickMode, options: SetToolOptions = {}) {
        //Initialize undefined options
        if (options.select == undefined) options.select = true;
        if (options.activate == undefined) options.activate = true;
        if (options.setAsNoAction == undefined) options.setAsNoAction = type == ClickMode.left;

        //Get previous tool
        const previousTool = this.currentTools.get(type);
        if (previousTool) {
            //Return if it's the same
            if (previousTool == tool) return;

            //Deselect and deactivate previous tool
            if (options.select) previousTool.selected = false;
            if (options.activate) previousTool.deactivate();
        }

        //Select new tool (and maybe set it as the tool for no click mode)
        this.currentTools.set(type, tool);
        if (options.setAsNoAction) this.currentTools.set(ClickMode.none, tool);

        //Select and activate the tool
        if (options.select && tool) tool.selected = true;
        if (options.activate && tool) tool.activate();

        //Fire tool changed
        this.onToolChange.fire(previousTool, tool, type);
    }

    /**
     * @description Returns the tool associated with the given key
     * @param key
     */
    public getToolByKey(key: string): Tool {
        const toolName = this.mappedKeysToTool.get(key);
        if (!toolName) return null;
        return this.tools.get(toolName);
    }

    /**
     * @description Sets tool associated with the provided key as the current tool for the key mode
     * @param key
     */
    public setToolByKey(key: string): boolean {
        const tool = this.getToolByKey(key);
        if (!tool) return false;
        this.setTool(tool, ClickMode.key, {select: false});
        return true;
    }
}