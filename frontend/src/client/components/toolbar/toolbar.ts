import {define, element, turbo, TurboTool} from "turbodombuilder";
import "./toolbar.css";
import {VcComponent} from "../component/component";
import {Project} from "../../directors/project/project";
import {ToolbarProperties, ToolbarToolProperties} from "./toolbar.types";
import {tool, Tool} from "../tool/tool";

@define("vc-toolbar")
export class Toolbar extends VcComponent<any, any, any, Project> {
    public createTool(entry: ToolbarToolProperties): Tool {
        if (typeof entry === "function") return tool({tools: entry, director: this.director});
        if (entry instanceof Tool) return entry;
        return tool({director: this.director, ...entry});
    }

    public addTools(...tools: ToolbarToolProperties[]) {
        tools.forEach(tool => {
            turbo(this).addChild(this.createTool(tool));
        });
    }
}

export function toolbar(properties: ToolbarProperties = {}): Toolbar {
    turbo(properties).applyDefaults({tag: "vc-toolbar"});
    return element({...properties}) as Toolbar;
}