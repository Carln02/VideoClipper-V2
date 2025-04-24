import {RendererModel} from "../renderer/renderer.model";
import {ClipRendererTextModel} from "./clipRenderer.textModel";
import {TextElement} from "../textElement/textElement";
import {SyncedText} from "../textElement/textElement.types";
import {SyncedClip} from "../clip/clip.types";
import {SyncedCard} from "../card/card.types";
import {Clip} from "../clip/clip";
import {auto} from "turbodombuilder";
import {ClipRendererVisibility} from "./clipRenderer.types";
import { YMap } from "../../../../yManagement/yManagement.types";

export class ClipRendererModel extends RendererModel {
    public readonly videoElementsCount: number = 2 as const;
    public readonly videoClips: Clip[] = [];
    public readonly offsets: number[] = [];

    private readonly textModel: ClipRendererTextModel;

    public readonly frameUpdateFrequency: number = 100 as const;
    public lastFrameUpdate: number = 0;

    public onTextAdded: (syncedText: SyncedText, id: number, blockKey: string) => TextElement;

    public constructor() {
        super();
        this.textModel = new ClipRendererTextModel();
        this.textModel.onAdded = (data, id, blockKey) => this.onTextAdded(data, id, blockKey);
    }

    public get cardData(): YMap {
        return this.getBlockData("cardData");
    }

    public set cardData(value: YMap | SyncedCard) {
        this.setBlock(value as YMap, undefined, "cardData");
    }

    public get clipData(): YMap {
        return this.getBlockData("clipData");
    }

    public set clipData(value: YMap | SyncedClip) {
        this.setBlock(value as YMap, undefined, "clipData");
        this.textModel.clear();
        this.textModel.data = (value as YMap)?.get("content");
    }

    public get textElements(): TextElement[] {
        return this.textModel.getAllComponents();
    }

    public get cardTitle(): string {
        return this.cardData.get("title");
    }

    public get currentIndex(): number {
        return super.currentIndex;
    }

    public set currentIndex(value: number) {
        super.currentIndex = value;
        this.clipData = this.getClip()?.data;
    }

    public getClip(index: number = this.currentIndex): Clip {
        return this.videoClips[index];
    }

    public getOffset(index: number = this.currentIndex): number {
        return this.offsets[index];
    }

    @auto({cancelIfUnchanged: true})
    public set visibilityMode(value: ClipRendererVisibility) {
        this.fireCallback("reloadVisibility", value);
    }

    public setClipWithOffset(clip: Clip, offset: number = 0, index: number = this.currentIndex) {
        const prevClip = this.videoClips[index];
        if (clip != prevClip) this.videoClips[index] = clip;

        const prevOffset = this.offsets[index];
        if (offset != prevOffset) this.offsets[index] = offset;

        if (index == this.currentIndex) this.currentIndex = index;
        this.fireCallback("clipChanged", index);
    }
}