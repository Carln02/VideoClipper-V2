import {RendererModel} from "../../abstract/renderer/renderer.model";
import {YMap} from "../../../../yProxy/yProxy/types/base.types";
import {ClipRendererTextModel} from "./clipRenderer.textModel";
import {TextElement} from "../textElement/textElement";
import {SyncedText} from "../textElement/textElement.types";
import {SyncedClip} from "../clip/clip.types";
import {SyncedCard} from "../card/card.types";

export class ClipRendererModel extends RendererModel {
    private readonly textModel: ClipRendererTextModel;

    public onTextAdded: (syncedText: SyncedText, id: number, blockKey: string) => TextElement;

    public constructor() {
        super();
        this.textModel = new ClipRendererTextModel();
        this.textModel.onAdded = (data, id, blockKey) => this.onTextAdded(data, id, blockKey);
    }

    public get cardData(): YMap {
        return this.getDataBlock("cardData");
    }

    public set cardData(value: YMap | SyncedCard) {
        this.setDataBlock(value as YMap, undefined, "cardData");
    }

    public get clipData(): YMap {
        return this.getDataBlock("clipData");
    }

    public set clipData(value: YMap | SyncedClip) {
        this.setDataBlock(value as YMap, undefined, "clipData");
        this.textModel.data = (value as YMap).get("content");
    }

    public get textElements(): TextElement[] {
        return this.textModel.getAllComponents();
    }

    public get cardTitle(): string {
        return this.cardData.get("title");
    }
}