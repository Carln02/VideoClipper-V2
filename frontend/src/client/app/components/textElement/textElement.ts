import {SyncedText, TextElementProperties, TextType} from "./textElement.types";
import {define, Point, TurboElement} from "turbodombuilder";
import {ClipRenderer} from "../clipRenderer/clipRenderer";
import "./textElement.css";
import {Clip} from "../clip/clip";
import {Card} from "../card/card";
import {Camera} from "../../views/camera/camera";
import {TextElementView} from "./textElement.view";
import {TextElementModel} from "./textElement.model";

@define("vc-text-entry")
export class TextElement extends TurboElement<TextElementView, SyncedText, TextElementModel> {
    public readonly renderer: ClipRenderer;

    public constructor(properties: TextElementProperties) {
        super(properties);
        this.renderer = properties.renderer;
        this.mvc.generate({
            viewConstructor: TextElementView,
            modelConstructor: TextElementModel,
            data: properties.data
        });
    }

    public get clip(): Clip {
        return this.renderer.clip;
    }

    public get card(): Card {
        return this.clip?.card;
    }

    public get type(): TextType {
        return this.model.type;
    }

    public set textValue(value: string) {
        this.view.textValue = value;
    }

    public get boxWidth(): number {
        let boxWidth = this.model.boxWidth;
        if (!boxWidth) {
            boxWidth = (this.offsetWidth / this.renderer?.offsetWidth * 100) || 0;
            this.model.boxWidth = boxWidth;
        }
        return boxWidth;
    }

    public get boxHeight() {
        let boxHeight = this.model.boxHeight;
        if (!boxHeight) {
            boxHeight = (this.offsetHeight / this.renderer?.offsetHeight * 100) || 0;
            this.model.boxHeight = boxHeight;
        }
        return boxHeight;
    }

    public translateBy(deltaPosition: Point) {
        this.model.origin = deltaPosition
            .div(Camera.instance.frameWidth, Camera.instance.frameHeight)
            .add(this.model.origin)
            .object;
    }

    public select(b: boolean) {
        this.view.resizer.show(b);
    }
}