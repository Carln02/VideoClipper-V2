import {Coordinate, define, flexRow, spacer, TurboNumericalInput} from "turbodombuilder";
import {SidePanel} from "../../sidePanel";
import "./textSidePanel.css";
import {SyncedText} from "../../../textElement/textElement.types";
import {SyncedComponent} from "../../../../abstract/syncedComponent/syncedComponent";
import {ContextEntry} from "../../../../managers/contextManager/contextManager.types";
import {TextElement} from "../../../textElement/textElement";
import {SidePanelInstance} from "../../sidePanel.types";
import {YWrapObserver} from "../../../../abstract/syncedComponent/syncedComponent.types";
import {ContextManager} from "../../../../managers/contextManager/contextManager";

@define("text-side-panel")
export class TextSidePanel extends SyncedComponent<SyncedText> implements SidePanelInstance, YWrapObserver<SyncedText> {
    private readonly sidePanel: SidePanel;

    private originXInput: TurboNumericalInput;
    private originYInput: TurboNumericalInput;

    private fontSizeInput: TurboNumericalInput;

    constructor(sidePanel: SidePanel) {
        super();
        this.sidePanel = sidePanel;
        this.setStyle("top", sidePanel.panelMarginTop + "px");

        this.initInputFields();
        this.initUI();
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
                    this.data.origin = {x: this.originXInput.value, y: this.originYInput.value};
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
                    this.data.origin = {x: this.originXInput.value, y: this.originYInput.value};
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
                    this.data.fontSize = this.fontSizeInput.value;
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

    public onOriginUpdated(value: Coordinate) {
        this.originXInput.value = value.x;
        this.originYInput.value = value.y;
    }

    public onFontSizeUpdated(value: number) {
        this.fontSizeInput.value = value;
    }
}