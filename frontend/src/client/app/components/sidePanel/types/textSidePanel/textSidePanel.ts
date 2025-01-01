import {Coordinate, define, flexRow, spacer, TurboNumericalInput} from "turbodombuilder";
import {SidePanel} from "../../sidePanel";
import "./textSidePanel.css";
import {SyncedText} from "../../../textElement/textElement.types";
import {SyncedComponent} from "../../../../abstract/syncedComponent/syncedComponent";
import {ContextEntry} from "../../../../managers/contextManager/contextManager.types";
import {TextElement} from "../../../textElement/textElement";
import {SidePanelInstance} from "../../sidePanel.types";
import {ContextManager} from "../../../../managers/contextManager/contextManager";
import {YCoordinate, YNumber} from "../../../../../../yProxy/yProxy/types/proxied.types";
import {YComponent} from "../../../../../../yManagement/yMvc/yComponent";

@define()
export class TextSidePanel extends YComponent<SyncedText> implements SidePanelInstance {
    private readonly sidePanel: SidePanel;

    private originXInput: TurboNumericalInput;
    private originYInput: TurboNumericalInput;

    private fontSizeInput: TurboNumericalInput;

    constructor(sidePanel: SidePanel) {
        super(null);
        this.sidePanel = sidePanel;
        this.setStyle("top", sidePanel.panelMarginTop + "px");

        this.initInputFields();
        this.initUI();
    }

    protected setupCallbacks() {
        // this.data.origin.bind(YProxyEventName.changed, (value: Coordinate) => {
        //     this.originXInput.value = value.x;
        //     this.originYInput.value = value.y;
        // }, this);
        //
        // this.data.fontSize.bind(YProxyEventName.changed, (value: number) =>
        //     this.fontSizeInput.value = value, this);
    }

    public attach() {
        ContextManager.instance.onContextChange.add(this.updateDataFromContext);
        const data = ContextManager.instance.getOfType(TextElement)?.data;
        if (data) this.data = data;
    }

    public detach() {
        ContextManager.instance.onContextChange.remove(this.updateDataFromContext);
    }

    private updateDataFromContext(entry: ContextEntry) {
        if (entry.level != 3) return;
        if (!(entry.element instanceof TextElement)) return;
        if (entry.changed == "added") this.data = entry.element.data;
        else delete this.data; //TODO FIX MAYBE - I want to clear the value in the instance without setting the value to null in the doc
    }

    private initInputFields() {
        this.originXInput = new TurboNumericalInput({
            inputProperties: {type: "number", step: "1", min: "0", max: "100"},
            label: "Position",
            prefix: "x: ",
            suffix: "%",

            multiplier: 100,
            decimalPlaces: 2,

            listeners: {
                input: () => {
                    if (!this.data) return;
                    this.data.origin = {x: this.originXInput.value, y: this.originYInput.value} as YCoordinate;
                }
            }
        });

        this.originYInput = new TurboNumericalInput({
            inputProperties: {type: "number", step: "1", min: "0", max: "100"},
            prefix: "y: ",
            suffix: "%",

            multiplier: 100,
            decimalPlaces: 2,

            listeners: {
                input: () => {
                    if (!this.data) return;
                    this.data.origin = {x: this.originXInput.value, y: this.originYInput.value} as YCoordinate;
                }
            }
        });

        this.fontSizeInput = new TurboNumericalInput({
            inputProperties: {type: "number", step: "1", min: "0", max: "100"},
            label: "Font size",
            suffix: "%",

            multiplier: 100,
            decimalPlaces: 2,

            listeners: {
                input: () => {
                    if (!this.data) return;
                    this.data.fontSize = this.fontSizeInput.value as YNumber;
                }
            }
        });
    }

    private initUI() {
        flexRow({
            parent: this,
            style: "gap: 0.5em; align-items: end",
            children: [this.originXInput, spacer(), this.originYInput]
        });

        this.addChild(this.fontSizeInput);
    }
}