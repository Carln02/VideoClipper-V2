import {TextPanel} from "./textPanel";
import {TextPanelModel} from "./textPanel.model";
import {
    Coordinate,
    DefaultEventName,
    flexRow,
    numericalInput,
    spacer, turbo,
    TurboNumericalInput,
    TurboView
} from "turbodombuilder";

export class TextPanelView extends TurboView<TextPanel, TextPanelModel> {
    private originXInput: TurboNumericalInput;
    private originYInput: TurboNumericalInput;

    private fontSizeInput: TurboNumericalInput;

    protected setupChangedCallbacks() {
        super.setupChangedCallbacks();

        this.emitter.add("fontSize", (value: number) => this.fontSizeInput.value = value);
        this.emitter.add("origin", (value: Coordinate) => {
            this.originXInput.value = value.x;
            this.originYInput.value = value.y;
        });
    }

    protected setupUIElements() {
        super.setupUIElements();
        // this.element.setStyle("top", this.element.toolPanel.panelMarginTop + "px");

        this.originXInput = numericalInput({
            input: {type: "number", step: "1", min: "0", max: "100"},
            label: "Position : ",
            prefix: "x: ",
            suffix: "%",
            multiplier: 100,
            decimalPlaces: 2
        });

        this.originYInput = numericalInput({
            input: {type: "number", step: "1", min: "0", max: "100"},
            prefix: "y: ",
            suffix: "%",
            multiplier: 100,
            decimalPlaces: 2
        });

        this.fontSizeInput = numericalInput({
            input: {type: "number", step: "1", min: "0", max: "100"},
            label: "Font size : ",
            suffix: "%",
            multiplier: 100,
            decimalPlaces: 2,
        });
    }

    protected setupUILayout() {
        super.setupUILayout();

        turbo(this).addChild([
            flexRow({
                style: "gap: 0.5em; align-items: end",
                children: [this.originXInput, spacer(), this.originYInput]
            }),
            this.fontSizeInput
        ]);
    }

    protected setupUIListeners() {
        super.setupUIListeners();

        turbo(this.originXInput).on(DefaultEventName.input, () => {
            if (!this.model.data) return;
            this.model.origin = {x: this.originXInput.value, y: this.originYInput.value};
        });

        turbo(this.originYInput).on(DefaultEventName.input, () => {
            if (!this.model.data) return;
            this.model.origin = {x: this.originXInput.value, y: this.originYInput.value};
        });

        turbo(this.fontSizeInput).on(DefaultEventName.input, () => {
            if (!this.model.data) return;
            this.model.fontSize = this.fontSizeInput.value;
        });
    }
}