import {YArrayManagerModel} from "../../../../yManagement/yModel/types/yManagerModel/types/yArrayManagerModel";
import {Clip} from "../clip/clip";
import {YArray} from "../../../../yManagement/yManagement.types";
import {SyncedClip} from "../clip/clip.types";
import {ClipTimelineEntry} from "./timeline.types";
import {auto, trim} from "turbodombuilder";
import {TimelineClipHandler} from "./timeline.clipHandler";
import {TimelineTimeHandler} from "./timeline.timeHandler";

export class TimelineModel extends YArrayManagerModel<SyncedClip, Clip> {
    public readonly pixelsPerSecondUnit: number = 20 as const;
    public readonly timeIncrementMs = 10 as const;
    public readonly timeIncrementS = 0.01 as const;

    public currentClipInfo: ClipTimelineEntry;

    public playTimer: NodeJS.Timeout | null = null;
    public nextTimer: NodeJS.Timeout | null = null;

    private _currentTime: number = 0;

    public onClipAdded: (syncedClip: SyncedClip, id: number, blockKey: string) => Clip = () => undefined;
    public onClipChanged: (syncedClip: SyncedClip, clip: Clip, id: number, blockKey: string) => void = () => {};

    public constructor(data?: YArray<SyncedClip>) {
        super(data);

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

    public get clipHandler(): TimelineClipHandler {
        return this.getHandler("clip") as TimelineClipHandler;
    }

    public get timeHandler(): TimelineTimeHandler {
        return this.getHandler("time") as TimelineTimeHandler;
    }

    public get currentClip() {
        return this.currentClipInfo?.clip;
    }

    public get currentTime(): number {
        return this._currentTime;
    }

    public set currentTime(value: number) {
        this._currentTime = trim(value, this.totalDuration);
        this.fireCallback("currentTimeChanged");
    }

    @auto()
    public set totalDuration(value: number) {
        this.fireCallback("totalDurationChanged");
    }
}