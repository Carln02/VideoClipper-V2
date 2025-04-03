import {SyncedText, TextElementProperties, TextType} from "./textElement.types";
import {define, Point} from "turbodombuilder";
import {ClipRenderer} from "../clipRenderer/clipRenderer";
import "./textElement.css";
import {Clip} from "../clip/clip";
import {Card} from "../card/card";
import {TextElementView} from "./textElement.view";
import {TextElementModel} from "./textElement.model";
import {Camera} from "../../screens/camera/camera";
import {VcComponent} from "../component/component";
import {DocumentManager} from "../../managers/documentManager/documentManager";

@define("vc-text-entry")
export class TextElement extends VcComponent<TextElementView, SyncedText, TextElementModel, DocumentManager> {
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

    public connectedCallback() {
        requestAnimationFrame(() => {
            this.mvc.emitter.fire("fontSize", this.model.fontSize);
            this.mvc.emitter.fire("origin", this.model.origin);
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
            .div(this.screenManager.camera.frameWidth, this.screenManager.camera.frameHeight)
            .add(this.model.origin)
            .object;
    }

    public select(b: boolean) {
        this.view.resizer.show(b);
    }
}