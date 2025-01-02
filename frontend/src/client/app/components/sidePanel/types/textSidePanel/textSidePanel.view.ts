import {YView} from "../../../../../../yManagement/yMvc/yView";
import {TextSidePanel} from "./textSidePanel";
import {TextSidePanelModel} from "./textSidePanel.model";
import {Coordinate, DefaultEventName, define, flexRow, input, spacer, TurboNumericalInput} from "turbodombuilder";

export class TextSidePanelView extends YView<TextSidePanel, TextSidePanelModel> {
    private originXInput: TurboNumericalInput;
    private originYInput: TurboNumericalInput;

    private fontSizeInput: TurboNumericalInput;

    protected setupChangedCallbacks() {
        super.setupChangedCallbacks();

        this.setChangedCallback("fontSize", (value: number) => this.fontSizeInput.value = value);
        this.setChangedCallback("origin", (value: Coordinate) => {
            this.originXInput.value = value.x;
            this.originYInput.value = value.y;
        });
    }

    protected setupUIElements() {
        super.setupUIElements();
        this.element.setStyle("top", this.element.sidePanel.panelMarginTop + "px");

        this.originXInput = new TurboNumericalInput({
            element: input({type: "number", step: "1", min: "0", max: "100"}),
            label: "Position",
            prefix: "x: ",
            suffix: "%",
            multiplier: 100,
            decimalPlaces: 2
        });

        this.originYInput = new TurboNumericalInput({
            element: input({type: "number", step: "1", min: "0", max: "100"}),
            prefix: "y: ",
            suffix: "%",
            multiplier: 100,
            decimalPlaces: 2
        });

        this.fontSizeInput = new TurboNumericalInput({
            element: input({type: "number", step: "1", min: "0", max: "100"}),
            label: "Font size",
            suffix: "%",
            multiplier: 100,
            decimalPlaces: 2,
        });
    }

    protected setupUILayout() {
        super.setupUILayout();

        this.element.addChild([
            flexRow({
                style: "gap: 0.5em; align-items: end",
                children: [this.originXInput, spacer(), this.originYInput]
            }),
            this.fontSizeInput
        ]);
    }

    protected setupUIListeners() {
        super.setupUIListeners();

        this.originXInput.addListener(DefaultEventName.input, () => {
            if (!this.model.data) return;
            this.model.origin = {x: this.originXInput.value, y: this.originYInput.value};
        });

        this.originYInput.addListener(DefaultEventName.input, () => {
            if (!this.model.data) return;
            this.model.origin = {x: this.originXInput.value, y: this.originYInput.value};
        });

        this.fontSizeInput.addListener(DefaultEventName.input, () => {
            if (!this.model.data) return;
            this.model.fontSize = this.fontSizeInput.value;
        });
    }
}