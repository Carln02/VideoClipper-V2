import {SyncedText, TextElementProperties, TextType} from "./textElement.types";
import {auto, createYMap, define, element, expose, Point, turbo, YMap} from "turbodombuilder";
import {ClipRenderer} from "../clipRenderer/clipRenderer";
import "./textElement.css";
import {Clip} from "../clip/clip";
import {Card} from "../card/card";
import {TextElementView} from "./textElement.view";
import {TextElementModel} from "./textElement.model";
import {VcComponent} from "../component/component";
import {Project} from "../../directors/project/project";

@define("vc-text-element")
export class TextElement extends VcComponent<TextElementView, SyncedText, TextElementModel, Project> {
    public renderer: ClipRenderer;

    public static createData(data?: SyncedText): YMap & SyncedText {
        if (!data) data = {type: TextType.title};
        if (!data.fontSize) data.fontSize = 0.1;
        if (!data.origin) data.origin = {x: 0.5, y: 0.5};
        if (!data.type) data.type = TextType.custom;
        return createYMap<SyncedText>(data);
    }

    @expose("renderer", false) public accessor clip: Clip;
    @expose("renderer", false) public accessor card: Card;
    @expose("model", false) public accessor type: TextType;

    @expose("view") public accessor textValue: string;

    public get boxWidth(): number {
        let boxWidth = this.model.boxWidth;
        if (!boxWidth) {
            boxWidth = (this.offsetWidth / this.renderer?.offsetWidth * 100) || 0;
            this.model.boxWidth = boxWidth;
        }
        return boxWidth;
    }

    public set boxWidth(value: number) {
        this.model.boxWidth = value;
    }

    public get boxHeight() {
        let boxHeight = this.model.boxHeight;
        if (!boxHeight) {
            boxHeight = (this.offsetHeight / this.renderer?.offsetHeight * 100) || 0;
            this.model.boxHeight = boxHeight;
        }
        return boxHeight;
    }

    public set boxHeight(value: number) {
        this.model.boxHeight = value;
    }

    public translateBy(deltaPosition: Point) {
        const value= deltaPosition
            .div(this.renderer.offsetWidth, this.renderer.offsetHeight)
            .add(this.model.origin)
            .object;
        if (value.x < 0) value.x = 0;
        if (value.y < 0) value.y = 0;
        if (value.x > 1) value.x = 1;
        if (value.y > 1) value.y = 1;
        this.model.origin = value;
    }

    @auto({override: true}) public set selected(b: boolean) {
        turbo(this.view.resizer).show(b);
    }

    public delete() {
        this.clip.removeText(this);
    }
}

export function textElement(properties: TextElementProperties): TextElement {
    turbo(properties).applyDefaults({tag: "vc-text-element", model: TextElementModel, view: TextElementView});
    return element({...properties}) as TextElement;
}