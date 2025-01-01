import {RendererModel} from "../../abstract/renderer/renderer.model";
import {ClipRenderer} from "./clipRenderer";
import {YMap} from "../../../../yProxy/yProxy/types/base.types";
import {ClipRendererTextModel} from "./clipRenderer.textModel";
import {TextElement} from "../textElement/textElement";
import {SyncedText} from "../textElement/textElement.types";

export class ClipRendererModel extends RendererModel<ClipRenderer> {
    private readonly textModel: ClipRendererTextModel;

    public onTextAdded: (syncedText: SyncedText, id: number, blockKey: string) => TextElement;

    public constructor(clipRenderer: ClipRenderer) {
        super(undefined, clipRenderer);
        this.textModel = new ClipRendererTextModel();
        this.textModel.onAdded = (data, id, blockKey) => this.onTextAdded(data, id, blockKey);
    }

    public get cardData(): YMap {
        return this.getDataBlock("cardData");
    }

    public set cardData(value: YMap) {
        this.setDataBlock(value, "cardData");
    }

    public get clipData(): YMap {
        return this.getDataBlock("clipData");
    }

    public set clipData(value: YMap) {
        this.setDataBlock(value, "clipData");
        this.textModel.data = value.get("content");
    }

    public get textElements(): TextElement[] {
        return this.textModel.getAllComponents();
    }

    public get cardTitle(): string {
        return this.cardData.get("title");
    }
}