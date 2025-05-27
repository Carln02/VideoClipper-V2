import {TimelineModel} from "./timeline.model";
import {Clip} from "../clip/clip";
import {SyncedClip} from "../clip/clip.types";
import {YUtilities} from "../../../yManagement/yUtilities";
import {TurboHandler} from "turbodombuilder";
import {YMap} from "yjs/dist/src/types/YMap";
import {TimelineIndexInfo} from "./timeline.types";

export class TimelineClipHandler extends TurboHandler<TimelineModel> {
    public getClipIndexAtTimestamp(time: number = this.model.currentTime): TimelineIndexInfo {
        if (this.model.totalClipsCount <= 0) return;
        let index = 0, accumulatedTime = 0;

        while (index < this.model.totalClipsCount && accumulatedTime + this.getClipAt(index)?.duration < time) {
            accumulatedTime += this.getClipAt(index)?.duration;
            index++;
        }

        if (index == this.model.totalClipsCount) {
            index = this.model.totalClipsCount - 1;
            accumulatedTime -= this.getClipAt(index)?.duration;
        }

        const offset = time - accumulatedTime;
        const offsetToNext = this.getClipAt(index)?.duration - offset;
        const closestToNext = offsetToNext < offset;

        return {
            clipIndex: index,
            cardIndex: this.convertIndexToBlockScope(index)[0],
            ghostingIndex: (index == 0 && !closestToNext)
                ? null
                : closestToNext ? index : index - 1,
            offset: offset,
            closestIntersection: closestToNext ? (index + 1) : index,
            distanceFromClosestIntersection: closestToNext ? offsetToNext : offset
        };
    }

    public getClipAt(index: number): Clip {
        const [blockKey, localIndex] = this.convertIndexToBlockScope(index);
        return this.model.getInstance(localIndex, blockKey);
    }

    public async addClip(clip: SyncedClip & YMap, index?: number): Promise<number> {
        const [blockKey, localIndex] = this.convertIndexToBlockScope(index);
        return YUtilities.addInYArray(clip, this.model.getClipsAt(blockKey), localIndex);
    }

    public removeClip(clip: Clip) {
        this.removeClipAt(this.model.getAllComponents().indexOf(clip));
    }

    public removeClipAt(index: number) {
        if (index == undefined || index < 0) return;
        const [blockKey, localIndex] = this.convertIndexToBlockScope(index);
        this.model.getClipsAt(blockKey).delete(localIndex, 1);
    }

    public convertIndexToBlockScope(index: number): [number, number] {
        if (!index || index < 0) return [0, 0];
        const blockKeys = this.model.getAllBlockKeys();

        for (const key of blockKeys) {
            const size = this.model.getSize(key);
            if (index < size) return [key, index];
            index -= size;
        }

        const lastKey = blockKeys[blockKeys.length - 1] as number;
        return [lastKey, this.model.getSize(lastKey)];
    }

    public convertBlockScopeToIndex(index: number, blockKey: number): number {
        const blockKeys = this.model.getAllBlockKeys();
        let globalIndex = 0;

        for (const key of blockKeys) {
            if (key === blockKey) break;
            globalIndex += this.model.getSize(key);
        }

        return globalIndex + index;
    }
}