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
import {SyncedType, YWrapObserver} from "../../abstract/syncedComponent/syncedComponent.types";
import {Card} from "../card/card";
import {Camera} from "../../views/camera/camera";

@define("vc-text-entry")
export class TextElement extends SyncedComponent<SyncedText> implements YWrapObserver<SyncedText> {
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
            if (this.data.type == TextType.custom) this.data.text = this.content.textContent;
        });
    }

    public get clip(): Clip {
        for (const observer of this.data.get_parent().get_parent().get_observers()) {
            if (!(observer instanceof Clip)) continue;
            return observer;
        }
        return;
    }

    public get card(): Card {
        return this.clip.card;
    }

    public static create(data: SyncedTextData, cardId: string, clipIndex: number, index?: number): number {
        const clipContent = this.root.cards[cardId]?.syncedClips[clipIndex]?.content as SyncedType<SyncedText[]>;
        if (!clipContent) return -1;
        return super.createInArray(data, clipContent, index);
    }

    public onTextUpdated(value: string) {
        if (this.data.type == TextType.custom) this.textContent = value;
    }

    public onTypeUpdated(value: TextType) {
        switch (value) {
            case TextType.timestamp:
                this.textValue = this.card.data.metadata.timestamp;
                return;
            case TextType.title:
                this.textValue = this.card.data.title;
                return;
            default:
                this.textValue = this.data.text;
                return;
        }
    }

    private get textValue(): string {
        return this.content.textContent;
    }

    private set textValue(value: string) {
        this.content.textContent = value;
    }

    public get boxWidth() {
        if (!this.data.boxWidth) this.data.boxWidth = (this.offsetWidth / this.renderer?.offsetWidth * 100) || 0;
        return this.data.boxWidth;
    }

    public set boxWidth(value: number) {
        if (this.data.boxWidth == value) return;
        this.data.boxWidth = value;
    }

    public get boxHeight() {
        if (!this.data.boxHeight) this.data.boxHeight = (this.offsetHeight / this.renderer?.offsetHeight * 100) || 0;
        return this.data.boxHeight || 0;
    }

    public set boxHeight(value: number) {
        if (this.data.boxHeight == value) return;
        this.data.boxHeight = value;
    }

    /**
     * The origin (anchor) position of the card
     */
    public onOriginUpdated(value: Coordinate) {
        this.setStyle("transform", `translate3d(calc(${(value.x * this.renderer.width) || 0}px - 50%), 
        calc(${(value.y * this.renderer.height) || 0}px - 50%), 0)`);
    }

    /**
     * @description The font size of the text element
     */
    public onFontSizeUpdated(value: number) {
        this.content.setStyle("fontSize", value * this.renderer.offsetHeight + "px");
    }

    public onBoxWidthUpdated(value: number) {
        this.setStyle("width", value + "%");
    }

    public onBoxHeightUpdated(value: number) {
        this.setStyle("height", value + "%");
    }

    public translateBy(deltaPosition: Point) {
        this.data.origin = deltaPosition
            .div(Camera.instance.frameWidth, Camera.instance.frameHeight)
            .add(this.data.origin)
            .object;
    }

    public select(b: boolean) {
        this.resizer.show(b);
    }
}