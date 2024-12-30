import {SyncedText, TextType} from "./textElement.types";
import {Coordinate, define, element, Point, TurboEvent, TurboEventName, TurboProperties} from "turbodombuilder";
import {ClipRenderer} from "../clipRenderer/clipRenderer";
import "./textElement.css";
import {ContextManager} from "../../managers/contextManager/contextManager";
import {ContextView} from "../../managers/contextManager/contextManager.types";
import {ToolManager} from "../../managers/toolManager/toolManager";
import {ToolType} from "../../managers/toolManager/toolManager.types";
import {Clip} from "../clip/clip";
import {Resizer} from "../basicComponents/resizer/resizer";
import {Card} from "../card/card";
import {Camera} from "../../views/camera/camera";
import {YComponent} from "../../yManagement/yComponent";

@define("vc-text-entry")
export class TextElement extends YComponent<SyncedText> {
    private readonly content: HTMLSpanElement;
    private readonly resizer: Resizer;

    private readonly renderer: ClipRenderer;

    constructor(data: SyncedText, renderer: ClipRenderer, properties: TurboProperties = {}) {
        super(properties);
        this.content = element({tag: "span", contentEditable: "true", role: "textbox", parent: this});
        this.renderer = renderer;

        if (renderer) this.resizer = new Resizer(this, renderer.textParent);

        this.data = data;

        this.addEventListener(TurboEventName.click, (e: TurboEvent) => {
            if (ContextManager.instance.view != ContextView.camera) return;
            if (ToolManager.instance.getFiredTool(e).name != ToolType.text) return;
            this.content.focus();
            e.stopImmediatePropagation();
        });

        this.addEventListener("blur", () => {
            if (this.type == TextType.custom) this.text = this.content.textContent;
        });
    }

    public get clip(): Clip {
        return this.renderer.currentClip;
    }

    public get card(): Card {
        return this.clip.card;
    }

    public get type(): TextType {
        return this.getData("type") as TextType;
    }

    public set type(value: TextType) {
        this.setData("type", value);
    }

    public get text(): string {
        return this.getData("text") as string;
    }

    public set text(value: string) {
        this.setData("text", value);
    }

    public get origin(): Coordinate {
        return this.getData("origin") as Coordinate;
    }

    public set origin(value: Coordinate) {
        this.setData("origin", value);
    }

    public get fontSize(): number {
        return this.getData("fontSize") as number;
    }

    public set fontSize(value: number) {
        this.setData("fontSize", value);
    }

    public get boxWidth(): number {
        let boxWidth = this.getData("boxWidth") as number;
        if (!boxWidth) {
            boxWidth = (this.offsetWidth / this.renderer?.offsetWidth * 100) || 0;
            this.boxWidth = boxWidth;
        }
        return boxWidth;
    }

    public set boxWidth(value: number) {
        if (this.boxWidth == value) return;
        this.setData("boxWidth", value);
    }

    public get boxHeight() {
        let boxHeight = this.getData("boxHeight") as number;
        if (!boxHeight) {
            boxHeight = (this.offsetHeight / this.renderer?.offsetHeight * 100) || 0;
            this.boxHeight = boxHeight;
        }
        return boxHeight;
    }

    public set boxHeight(value: number) {
        if (this.boxHeight == value) return;
        this.setData("boxHeight", value);
    }

    public get textValue(): string {
        return this.content.textContent;
    }

    public set textValue(value: string) {
        this.content.textContent = value;
    }

    public typeChanged(value: TextType) {
        switch (value.valueOf()) {
            case TextType.timestamp:
                this.textValue = this.card.metadata.timestamp;
                return;
            case TextType.title:
                this.textValue = this.card.title;
                return;
            default:
                this.textValue = this.text;
                return;
        }
    }

    public originChanged(value: Coordinate) {
        this.setStyle("transform", `translate3d(calc(${(value.x * this.renderer.width) || 0}px - 50%), 
                        calc(${(value.y * this.renderer.height) || 0}px - 50%), 0)`);
    }

    public fontSizeChanged(value: number) {
        this.content.setStyle("fontSize", value * this.renderer.offsetHeight + "px");
    }

    public textChanged(value: string) {
        if (this.type == TextType.custom) this.textContent = value;
    }

    public boxWidthChanged(value: number) {
        this.setStyle("width", value + "%");
    }

    public boxHeightChanged(value: number) {
        this.setStyle("height", value + "%");
    }

    public translateBy(deltaPosition: Point) {
        this.origin = deltaPosition
            .div(Camera.instance.frameWidth, Camera.instance.frameHeight)
            .add(this.data.origin)
            .object;
    }

    public select(b: boolean) {
        this.resizer.show(b);
    }
}