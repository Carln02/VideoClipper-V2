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
    private _currentFrameOffset: number;

    public readonly videoElementsCount: number = 2 as const;
    public readonly videoClips: Clip[] = [];

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

    public get currentClip(): Clip {
        return this.videoClips[this.currentIndex];
    }

    private set currentClip(value: Clip) {
        this.videoClips[this.currentIndex] = value;
        this.clipData = value.data;
    }

    public get currentFrameOffset(): number {
        return this._currentFrameOffset;
    }

    private set currentFrameOffset(value: number) {
        this._currentFrameOffset = value;
    }

    @auto({cancelIfUnchanged: true})
    public set visibilityMode(value: ClipRendererVisibility) {
        this.fireCallback("reloadVisibility");
    }

    public setCurrentClipWithOffset(clip: Clip, offset: number = this.currentFrameOffset) {
        if (clip != this.currentClip) this.currentClip = clip;
        if (this.currentFrameOffset != offset) this.currentFrameOffset = offset;
        this.fireCallback("frameChanged");
    }
}