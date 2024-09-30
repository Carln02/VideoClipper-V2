import {SyncedText, SyncedTextData, TextType} from "./textElement.types";
import {Coordinate, define, element, Point, TurboEvent, TurboEventName} from "turbodombuilder";
import {ClipRenderer} from "../clipRenderer/clipRenderer";
import "./textElement.css";
import {ContextManager} from "../../managers/contextManager/contextManager";
import {ContextView} from "../../managers/contextManager/contextManager.types";
import {ToolManager} from "../../managers/toolManager/toolManager";
import {ToolType} from "../../managers/toolManager/toolManager.types";
import {Clip} from "../clip/clip";
import {Resizer} from "../basicComponents/resizer/resizer";
import {SyncedComponent} from "../../abstract/syncedComponent/syncedComponent";
import {Card} from "../card/card";
import {Camera} from "../../views/camera/camera";
import {YCoordinate, YNumber, YString, YProxyEventName} from "../../../../yProxy";

@define("vc-text-entry")
export class TextElement extends SyncedComponent<SyncedText> {
    private readonly content: HTMLSpanElement;
    private readonly resizer: Resizer;

    private readonly renderer: ClipRenderer;

    constructor(data: SyncedText, renderer: ClipRenderer) {
        super();
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
            if (this.data.type == TextType.custom) this.data.text = this.content.textContent as YString;
        });
    }

    protected setupCallbacks() {
        this.data.origin.bind(YProxyEventName.changed, (value: Coordinate) => {
            this.setStyle("transform", `translate3d(calc(${(value.x * this.renderer.width) || 0}px - 50%), 
                        calc(${(value.y * this.renderer.height) || 0}px - 50%), 0)`);
        }, this);

        this.data.type.bind(YProxyEventName.changed, (value: TextType) => {
            switch (value.valueOf()) {
                case TextType.timestamp:
                    this.textValue = this.card.data.metadata.timestamp.value;
                    return;
                case TextType.title:
                    this.textValue = this.card.data.title.value;
                    return;
                default:
                    this.textValue = this.data.text.value;
                    return;
            }
        }, this);

        this.data.fontSize.bind(YProxyEventName.changed, (value: number) => this.content
            .setStyle("fontSize", value * this.renderer.offsetHeight + "px"), this);

        this.data.bindAtKey("text", YProxyEventName.changed, (value: YString) => {
            if (this.data.type == TextType.custom) this.textContent = value.value;
        }, this);

        this.data.bindAtKey("boxWidth", YProxyEventName.changed, (value: number) =>
            this.setStyle("width", value + "%"), this);
        this.data.bindAtKey("boxHeight", YProxyEventName.changed, (value: number) =>
            this.setStyle("height", value + "%"), this);
    }

    public get clip(): Clip {
        return this.data.parent.parent.getBoundObjectOfType(Clip);
    }

    public get card(): Card {
        return this.clip.card;
    }

    public static create(data: SyncedTextData, cardId: string, clipIndex: number, index?: number): number {
        const clipContent = this.root.cards[cardId]?.syncedClips[clipIndex]?.content;
        if (!clipContent) return -1;
        return super.createInArray(data, clipContent, index);
    }

    public get textValue(): string {
        return this.content.textContent;
    }

    public set textValue(value: string) {
        this.content.textContent = value;
    }

    public get boxWidth() {
        if (!this.data.boxWidth) this.data.boxWidth = ((this.offsetWidth
            / this.renderer?.offsetWidth * 100) || 0) as YNumber;
        return this.data.boxWidth;
    }

    public set boxWidth(value: number) {
        if (this.data.boxWidth == value) return;
        this.data.boxWidth = value as YNumber;
    }

    public get boxHeight() {
        if (!this.data.boxHeight) this.data.boxHeight = ((this.offsetHeight
            / this.renderer?.offsetHeight * 100) || 0) as YNumber;
        return this.data.boxHeight || 0;
    }

    public set boxHeight(value: number) {
        if (this.data.boxHeight == value) return;
        this.data.boxHeight = value as YNumber;
    }

    public translateBy(deltaPosition: Point) {
        this.data.origin = deltaPosition
            .div(Camera.instance.frameWidth, Camera.instance.frameHeight)
            .add(this.data.origin)
            .object as YCoordinate;
    }

    public select(b: boolean) {
        this.resizer.show(b);
    }
}