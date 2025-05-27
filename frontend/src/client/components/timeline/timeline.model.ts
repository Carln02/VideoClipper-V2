import {Clip} from "../clip/clip";
import {YArray} from "../../../yManagement/yManagement.types";
import {SyncedClip} from "../clip/clip.types";
import {TimelineIndexInfo} from "./timeline.types";
import {auto, trim} from "turbodombuilder";
import {TimelineClipHandler} from "./timeline.clipHandler";
import {TimelineTimeHandler} from "./timeline.timeHandler";
import {YManagerModel} from "../../../yManagement/yModel/types/yManagerModel";
import {Card} from "../card/card";

export class TimelineModel extends YManagerModel<SyncedClip, Clip, number, YArray, string, "array"> {
    public readonly pixelsPerSecondUnit: number = 20 as const;
    public readonly timeIncrementMs = 10 as const;
    public readonly timeIncrementS = 0.01 as const;

    public playTimer: NodeJS.Timeout | null = null;
    public nextTimer: NodeJS.Timeout | null = null;

    private _storedTotalDuration: number = 0;
    private _currentTime: number = 0;

    protected _cards: Card[];
    protected cardsModel: YManagerModel<string, Card, number, YArray>;

    public onCardAdded: (cardId: string, index: number) => Card = () => undefined;
    public onClipAdded: (syncedClip: SyncedClip, id: number, blockKey: number) => Clip = () => undefined;
    public onClipChanged: (syncedClip: SyncedClip, clip: Clip, id: number, blockKey: number) => void = () => {};

    public constructor(data?: YArray<SyncedClip>) {
        super(data, "array");

        this.cardsModel = new YManagerModel();
        this.cardsModel.onAdded = (cardId, index) => {
            const card = this.onCardAdded(cardId, index);
            if (!card) return undefined;
            this.setBlock(card.syncedClips, cardId, index);
            return card;
        }
        this.cardsModel.onDeleted = () => {};

        this.onAdded = (syncedClip, id, blockKey) => {

            return this.onClipAdded(syncedClip, id, blockKey);
        };

        const oldUpdated = this.onUpdated;
        this.onUpdated = (syncedClip, clip, id, blockKey) => {
            oldUpdated(syncedClip, clip, id, blockKey);
            return this.onClipChanged(syncedClip, clip, id, blockKey);
        };

        const oldDeleted = this.onDeleted;
        this.onDeleted = (syncedClip, clip, id, blockKey) => {
            oldDeleted(syncedClip, clip, id, blockKey);
            return this.onClipChanged(syncedClip, clip, id, blockKey);
        };
    }

    public get cardIds(): string[] {
       if (this._cards) return this._cards.map(card => card.dataId);
       return this.cardsModel.data.toArray();
    }

    public set cardIds(data: YArray<string>) {
        this._cards = undefined;
        this.clear();
        this.cardsModel.data = data;
    }

    public get cards(): Card[] {
        if (this._cards) return this._cards;
        return this.cardsModel.getAllComponents();
    }

    public set cards(data: Card[]) {
        this.cardsModel.data = undefined;
        this._cards = data;
        this.clear();

        data.forEach((card: Card, index: number) => {
            if (!card) return;
            this.setBlock(card.syncedClips, card.dataId, index)
        });
    }

    public getCardAt(index: number): Card {
        const cards = this.cards;
        if (typeof index !== "number") return null;
        if (index < 0) index = 0;
        if (index >= cards.length) index = cards.length - 1;
        return cards[index];
    }

    @auto()
    public set indexInfo(value: TimelineIndexInfo) {
    }

    public get currentClip() {
        return this.clipHandler?.getClipAt(this.indexInfo?.clipIndex);
    }

    public get currentGhostingClip() {
        if (this.indexInfo?.ghostingIndex == null) return null;
        return this.clipHandler?.getClipAt(this.indexInfo?.ghostingIndex);
    }

    public get currentCardData() {
        return this.currentClip?.card;
    }

    public get currentTime(): number {
        return this._currentTime;
    }

    public set currentTime(value: number) {
        this._currentTime = trim(value, this.totalDuration);
        this.fireCallback("currentTimeChanged");
    }

    public getClipsAt(index: number): YArray<SyncedClip> {
        return this.getBlockData(index);
    }

    public get totalDuration(): number {
        const newTotalDuration = this.getAllBlocks().flatMap(block => block.data.toJSON())
            .map((entry: SyncedClip) => entry.endTime - entry.startTime)
            .reduce((acc, cur) => acc + cur, 0);
        if (newTotalDuration == this._storedTotalDuration) return this._storedTotalDuration;
        this._storedTotalDuration = newTotalDuration;
        this.fireCallback("totalDurationChanged");
    }

    public get totalClipsCount(): number {
        return this.getAllBlocks().flatMap(block => block.data.toJSON())
            .reduce((acc) => acc + 1, 0);
    }

    public get clipHandler(): TimelineClipHandler {
        return this.getHandler("clip") as TimelineClipHandler;
    }

    public get timeHandler(): TimelineTimeHandler {
        return this.getHandler("time") as TimelineTimeHandler;
    }


}