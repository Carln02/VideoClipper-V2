import {define, ToolManager, ToolProperties, Tool} from "turbodombuilder";
import "./toolbar.css";
import {VcComponent} from "../component/component";
import {Project} from "../../directors/project/project";
import {ToolbarProperties} from "./toolbar.types";
import {VcTool} from "../../tools/tool/tool";

@define("vc-toolbar")
export class Toolbar<ToolType = string> extends VcComponent<any, any, any, Project> {
    public constructor(properties: ToolbarProperties<ToolType> = {}) {
        super(properties);
        properties.tools?.forEach(tool => this.addTool(tool));
    }

    public get toolManager(): ToolManager<ToolType> {
        return this.director.toolManager as ToolManager<ToolType>;
    }

    private createTool(tool: ToolType | ToolProperties<ToolType> | Tool<ToolType>): Tool<ToolType> {
        if (tool instanceof Tool) return tool;
        if (typeof tool === "object") return new VcTool<ToolType>({...tool, toolManager: this.toolManager, director: this.director});
        if (typeof tool === "string") return new VcTool<ToolType>({name: tool, toolManager: this.toolManager, director: this.director});
    }

    public addTool(tool: ToolType | ToolProperties<ToolType> | Tool<ToolType>) {
        const genTool = this.createTool(tool);
        this.addChild(genTool);
    }
}
