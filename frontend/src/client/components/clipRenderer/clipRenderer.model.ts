import {RendererModel} from "../renderer/renderer.model";
import {SyncedClip} from "../clip/clip.types";
import {SyncedCard} from "../card/card.types";
import {Clip} from "../clip/clip";
import {
    auto, blockDataSignal, blockSignal, modelSignal, signal, TurboYBlock, YArray, YMap
} from "turbodombuilder";
import {ClipRendererVisibility} from "./clipRenderer.types";

export class ClipRendererModel extends RendererModel {
    public readonly videoElementsCount: number = 2 as const;
    public readonly videoClips: Clip[] = [];
    public readonly offsets: number[] = [];

    public readonly frameUpdateFrequency: number = 100 as const;
    public lastFrameUpdate: number = 0;
    public renderOnCanvas: boolean;

    @signal public visibilityMode: ClipRendererVisibility;
    @modelSignal("title", "cardData") public cardTitle: string;

    @blockSignal() public textBlock: TurboYBlock<YArray, number>;
    @blockDataSignal() public cardData: YMap & SyncedCard;
    @blockDataSignal() public set clipData(value: YMap & SyncedClip) {
        if (!value) return;
        const textData = (value as YMap)?.get("content");
        if (textData !== this.textBlock.data) this.textBlock = (value as YMap)?.get("content");
    }

    @auto({override: true}) public set currentIndex(value: number) {
        this.clipData = this.getClip()?.data as any;
    }

    public getClip(index: number = this.currentIndex): Clip {
        return this.videoClips[index];
    }

    public getOffset(index: number = this.currentIndex): number {
        return this.offsets[index];
    }

    public setClipWithOffset(clip: Clip, offset: number = 0, index: number = this.currentIndex) {
        if (clip) offset += clip.startTime;
        this.videoClips[index] = clip;
        this.offsets[index] = offset;

        if (index === this.currentIndex) this.currentIndex = index;
        this.fireCallback("clipChanged", index);
    }
}