import {SyncedText, TextElementProperties, TextType} from "./textElement.types";
import {define, Point} from "turbodombuilder";
import {ClipRenderer} from "../clipRenderer/clipRenderer";
import "./textElement.css";
import {Clip} from "../clip/clip";
import {Card} from "../card/card";
import {TextElementView} from "./textElement.view";
import {TextElementModel} from "./textElement.model";
import {VcComponent} from "../component/component";
import {Project} from "../../screens/project/project";
import {YUtilities} from "../../../yManagement/yUtilities";
import {YMap} from "../../../yManagement/yManagement.types";

@define("vc-text-entry")
export class TextElement extends VcComponent<TextElementView, SyncedText, TextElementModel, Project> {
    public readonly renderer: ClipRenderer;

    public constructor(properties: TextElementProperties = {}) {
        super(properties);
        this.renderer = properties.renderer;
        this.mvc.generate({
            viewConstructor: TextElementView,
            modelConstructor: TextElementModel,
            data: properties.data
        });
    }

    public static createData(data?: SyncedText): YMap & SyncedText {
        if (!data) data = {type: TextType.title};
        if (!data.fontSize) data.fontSize = 0.1;
        if (!data.origin) data.origin = {x: 0.5, y: 0.5};
        if (!data.type) data.type = TextType.custom;
        return YUtilities.createYMap<SyncedText>(data);
    }

    public connectedCallback() {
        requestAnimationFrame(() => {
            this.mvc.emitter.fire("fontSize", this.model.fontSize);
            this.mvc.emitter.fire("origin", this.model.origin);
        });
    }

    public get clip(): Clip {
        return this.renderer?.clip;
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