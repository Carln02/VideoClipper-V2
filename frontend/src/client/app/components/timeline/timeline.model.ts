import {YArrayManagerModel} from "../../../../yManagement/yModel/types/yManagerModel/types/yArrayManagerModel";
import {Clip} from "../clip/clip";
import {YComponentModel} from "../../../../yManagement/yModel/types/yComponentModel";
import { YArray } from "../../../../yManagement/yManagement.types";
import {SyncedClip} from "../clip/clip.types";

export class TimelineModel extends YComponentModel {
    public readonly pixelsPerSecondUnit: number = 20 as const;

    protected readonly clipsManager: YArrayManagerModel<SyncedClip, Clip>;

    public onClipAdded: (syncedClip: SyncedClip, id: number, blockKey: string) => Clip = () => undefined;
    public onClipChanged: (syncedClip: SyncedClip, clip: Clip, id: number, blockKey: string) => void = () => {};

    public constructor(data?: YArray<SyncedClip>) {
        super();
        this.clipsManager = new YArrayManagerModel<SyncedClip, Clip>(data);

        this.clipsManager.onAdded = (syncedClip, id, blockKey) =>
            this.onClipAdded(syncedClip, id, blockKey);

        const oldUpdated = this.clipsManager.onUpdated;
        this.clipsManager.onUpdated = (syncedClip, clip, id, blockKey) => {
            oldUpdated(syncedClip, clip, id, blockKey);
            this.onClipChanged(syncedClip, clip, id, blockKey);
        };

        const oldDeleted = this.clipsManager.onDeleted;
        this.clipsManager.onDeleted = (syncedClip, clip, id, blockKey) => {
            oldDeleted(syncedClip, clip, id, blockKey);
            this.onClipChanged(syncedClip, clip, id, blockKey);
        };
    }
}