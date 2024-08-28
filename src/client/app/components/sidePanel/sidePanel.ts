import {ClickMode, DefaultEventName, define, div, icon, TurboElement} from "turbodombuilder";
import "./sidePanel.css";
import {ToolType} from "../../managers/toolManager/toolManager.types";
import {CaptureManager} from "../../views/camera/manager/captureManager/captureManager";
import {Camera} from "../../views/camera/camera";
import {ToolManager} from "../../managers/toolManager/toolManager";
import {ShootingSidePanel} from "./types/shootingSidePanel/shootingSidePanel";
import {TextSidePanel} from "./types/textSidePanel/textSidePanel";
import {ContextManager} from "../../managers/contextManager/contextManager";
import {TextElement} from "../textElement/textElement";
import {ContextEntry} from "../../managers/contextManager/contextManager.types";
import {SidePanelInstance} from "./sidePanel.types";

@define("camera-side-panel")
export class SidePanel extends TurboElement {
    private readonly panels: Map<ToolType, SidePanelInstance>;

    private readonly camera: Camera;
    private readonly captureManager: CaptureManager;

    private currentToolName: ToolType;
    private currentPanel: SidePanelInstance;
    private _panelMarginTop: number;

    constructor(camera: Camera, captureManager: CaptureManager) {
        super({parent: camera});
        this.panels = new Map<ToolType, SidePanelInstance>();

        this.panels.set(ToolType.shoot, new ShootingSidePanel(this.camera, this.captureManager, this));
        this.panels.set(ToolType.text, new TextSidePanel(this));

        this.camera = camera;
        this.captureManager = captureManager;

        const buttons = div({
            classes: "side-panel-buttons-div",
            parent: this,
            children: [
                icon({icon: "cancel"}),
                icon({icon: "save"}),
                icon({icon: "arrow-right", listeners: {[DefaultEventName.click]: () => this.camera.clear()}}),
            ]
        });

        //Init
        requestAnimationFrame(() => {
            this.panelMarginTop = buttons.offsetHeight + 32;
            this.changePanel(ToolManager.instance.getTool(ClickMode.left)?.name);
        });

        ToolManager.instance.onToolChange.add((oldTool, newTool, type) => {
            if (type != ClickMode.left) return;
            this.changePanel(newTool.name);
        });

        ContextManager.instance.onContextChange.add(this.changePanelOnContextChange);

        this.addEventListener(DefaultEventName.click, (e) => e.stopPropagation());
    }

    public get panelMarginTop() {
        return this._panelMarginTop;
    }

    private set panelMarginTop(value: number) {
        this._panelMarginTop = value;
    }

    private changePanel(toolName: ToolType) {
        if (this.currentToolName == toolName) return;

        this.currentPanel.detach();
        this.removeChild(this.currentPanel);

        this.currentPanel = this.panels.get(toolName);
        if (!this.currentPanel) return;

        this.addChild(this.currentPanel);
        this.currentPanel.attach();
    }

    private changePanelOnContextChange = (entry: ContextEntry) => {
        if (entry.element instanceof TextElement) {
            if (entry.changed == "added") this.changePanel(ToolType.text);
            else this.changePanel(ToolManager.instance.getTool(ClickMode.left).name);
        }
    }
}
