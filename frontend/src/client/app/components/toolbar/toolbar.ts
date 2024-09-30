import {define, TurboElement, TurboProperties, DefaultEventName, ClickMode} from "turbodombuilder";
import "./toolbar.css";
import {ToolManager} from "../../managers/toolManager/toolManager";
import {ToolView} from "../../tools/tool/toolView";
import {ToolType} from "../../managers/toolManager/toolManager.types";

@define("vc-toolbar")
export class Toolbar extends TurboElement {
    private toolManager: ToolManager;

    constructor(properties: TurboProperties = {}) {
        super(properties);

        this.toolManager = ToolManager.instance;
    }

    public populateWith(...names: ToolType[]) {
        names.forEach(name => this.addToolInstance(this.toolManager.getToolByName(name)?.createInstance()));
    }

    public populateWithAllTools() {
        this.toolManager.getToolsArray().forEach(tool => this.addToolInstance(tool.createInstance()));
    }

    private addToolInstance(tool: ToolView) {
        tool.addEventListener(DefaultEventName.click, (e) => {
            this.toolManager.setTool(tool.tool, ClickMode.left);
            e.stopImmediatePropagation();
        });

        this.addChild(tool);
    }
}
