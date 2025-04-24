import {Clip} from "../clip/clip";
import {YArray, YMap} from "../../../../yManagement/yManagement.types";
import {SyncedClip} from "../clip/clip.types";
import {TimelineIndexInfo} from "./timeline.types";
import {trim} from "turbodombuilder";
import {TimelineClipHandler} from "./timeline.clipHandler";
import {TimelineTimeHandler} from "./timeline.timeHandler";
import {YManagerModel} from "../../../../yManagement/yModel/types/yManagerModel";
import {SyncedCard} from "../card/card.types";

export class TimelineModel extends YManagerModel<SyncedClip, Clip, number, YArray, string, "array"> {
    public readonly pixelsPerSecondUnit: number = 20 as const;
    public readonly timeIncrementMs = 10 as const;
    public readonly timeIncrementS = 0.01 as const;

    //TODO PATH DATA FROM FLOW TAG --> OBSERVE AND UPDATE CLIP LISTS ON CHANGE
    // public readonly path: YArray<string>;

    public indexInfo: TimelineIndexInfo;

    public playTimer: NodeJS.Timeout | null = null;
    public nextTimer: NodeJS.Timeout | null = null;

    private _storedTotalDuration: number = 0;
    private _currentTime: number = 0;

    public onClipAdded: (syncedClip: SyncedClip, id: number, blockKey: number) => Clip = () => undefined;
    public onClipChanged: (syncedClip: SyncedClip, clip: Clip, id: number, blockKey: number) => void = () => {};

    public constructor(data?: YArray<SyncedClip>) {
        super(data, "array");

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

    public setCardsData(data: (SyncedCard & YMap)[], initialize: boolean = true) {
        this.clear();
        this.dataBlocks.length = 0;
        data.forEach((card, index) => this.addBlock(card.get("syncedClips"), undefined, index, initialize));
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

    public get currentGhostingClip() {
        return this.clipHandler?.getClipAt(this.indexInfo?.ghostingIndex);
    }

    public get currentClip() {
        return this.clipHandler?.getClipAt(this.indexInfo?.clipIndex);
    }

    public get currentTime(): number {
        return this._currentTime;
    }

    public set currentTime(value: number) {
        this._currentTime = trim(value, this.totalDuration);
        this.fireCallback("currentTimeChanged");
    }
}