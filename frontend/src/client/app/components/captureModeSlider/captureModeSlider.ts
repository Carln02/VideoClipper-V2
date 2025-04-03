import {
    define,
    Direction,
    PartialRecord,
    Point,
    TurboSelectWheel,
    TurboSelectWheelStylingProperties
} from "turbodombuilder";
import {CaptureModeSliderProperties} from "./captureModeSlider.types";
import "./captureModeSlider.css";

@define()
export class CaptureModeSlider extends TurboSelectWheel {
    public openTimeout: number = -1;

    public constructor(properties: CaptureModeSliderProperties) {
        super({
            ...properties,
            direction: Direction.horizontal,
            classes: "capture-mode-slider",
            opacity: {min: 0.3, max: 1},
            size: {min: 0.6, max: 1.3},
            style: "transform: rotate(-90deg)"
        });
        this.generateCustomStyling = this.customStyling;
    }

    protected computeDragValue(delta: Point): number {
        return delta.y / 20;
    }

    protected customStyling(properties: TurboSelectWheelStylingProperties): PartialRecord<keyof CSSStyleDeclaration, string | number> {
        const styles = properties.defaultComputedStyles;
        console.log(properties.opacityValue);
        console.log(properties.scaleValue);
        return styles;
    }
}