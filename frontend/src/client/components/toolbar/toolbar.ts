import {define, DefaultEventName, ClickMode} from "turbodombuilder";
import "./toolbar.css";
import {ToolView} from "../../tools/tool/toolView";
import {ToolType} from "../../managers/toolManager/toolManager.types";
import {VcComponent} from "../component/component";
import {Project} from "../../screens/project/project";
import {VcComponentProperties} from "../component/component.types";

@define("vc-toolbar")
export class Toolbar extends VcComponent<any, any, any, Project> {
    public constructor(properties: VcComponentProperties<any, any, any, Project> = {}) {
        super(properties);
    }

    public get toolManager() {
        return this.screenManager.toolManager;
    }

    public populateWith(...names: ToolType[]) {
        names.forEach(name => this.addToolInstance(this.toolManager.getToolByName(name)?.createInstance()));
    }

    public populateWithAllTools() {
        this.toolManager.getToolsArray().forEach(tool => this.addToolInstance(tool.createInstance()));
    }

    private addToolInstance(tool: ToolView) {
        tool?.addEventListener(DefaultEventName.click, (e) => {
            this.toolManager.setTool(tool.tool, ClickMode.left);
            e.stopImmediatePropagation();
        });

        this.addChild(tool);
    }
}
