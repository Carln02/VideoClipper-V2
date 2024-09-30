import {define, TurboButton} from "turbodombuilder";
import "./tool.css";
import {Tool} from "./tool";

/**
 * @description Basic DOM element that represents a tool (for now it's just a button)
 */
@define("vc-tool")
export class ToolView extends TurboButton<"h4"> {
    public readonly tool: Tool;
    private readonly selectedClass = "selected" as const;

    constructor(tool: Tool) {
        super({text: tool.name, elementTag: "h4", classes: "card clickable"});
        this.tool = tool;
        this.update();
    }

    /**
     * @description Selected state of the tool
     */
    public get selected() {
        return this.tool.selected;
    }

    public set selected(value: boolean) {
        this.tool.selected = value;
    }

    /**
     * @description Updates the visual appearance of the element based on the tool's state
     */
    public update() {
        this.toggleClass(this.selectedClass, this.selected);
    }
}
