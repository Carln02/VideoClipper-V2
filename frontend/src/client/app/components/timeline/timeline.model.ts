import {YArrayManagerModel} from "../../../../yManagement/yModel/types/yManagerModel/types/yArrayManagerModel";
import {Clip} from "../clip/clip";
import {YArray} from "../../../../yManagement/yManagement.types";
import {SyncedClip} from "../clip/clip.types";

export class TimelineModel extends YArrayManagerModel<SyncedClip, Clip> {
    public readonly pixelsPerSecondUnit: number = 20 as const;

    public onClipAdded: (syncedClip: SyncedClip, id: number, blockKey: string) => Clip = () => undefined;
    public onClipChanged: (syncedClip: SyncedClip, clip: Clip, id: number, blockKey: string) => void = () => {};

    public constructor(data?: YArray<SyncedClip>) {
        super(data);

        this.onAdded = (syncedClip, id, blockKey) => {
            return this.onClipAdded(syncedClip, id, blockKey);
        }

        const oldUpdated = this.onUpdated;
        this.onUpdated = (syncedClip, clip, id, blockKey) => {
            oldUpdated(syncedClip, clip, id, blockKey);
            this.onClipChanged(syncedClip, clip, id, blockKey);
        };

        const oldDeleted = this.onDeleted;
        this.onDeleted = (syncedClip, clip, id, blockKey) => {
            oldDeleted(syncedClip, clip, id, blockKey);
            this.onClipChanged(syncedClip, clip, id, blockKey);
        };
    }

    public getAllClips(): Clip[] {
        return this.getAllComponents();
    }

    public getClipAt(index: number): Clip {
        if (index < 0) index = 0;
        if (index > this.data.length - 1) index = this.data.length - 1;
        return this.getInstance(index);
    }
}