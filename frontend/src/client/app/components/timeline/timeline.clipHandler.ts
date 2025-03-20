import {TimelineModel} from "./timeline.model";
import {Clip} from "../clip/clip";
import {SyncedClip} from "../clip/clip.types";
import {randomColor} from "../../../utils/random";
import {YUtilities} from "../../../../yManagement/yUtilities";
import {TurboHandler} from "turbodombuilder";

export class TimelineClipHandler extends TurboHandler<TimelineModel> {
    public getClipAt(index: number): Clip {
        if (index < 0) index = 0;
        if (index > this.model.data.length - 1) index = this.model.data.length - 1;
        return this.model.getInstance(index);
    }

    public async addClip(clip: SyncedClip, index?: number) {
        if ((!index && index != 0) || index > this.model.data.length) index = this.model.data.length;
        if (!clip.color) clip.color = randomColor();
        return YUtilities.addInYArray(clip, this.model.data, index);
    }

    public removeClip(clip: Clip) {
        const index = this.model.getAllComponents().indexOf(clip);
        if (index < 0) return;
        this.model.data.delete(index);
    }

    public removeClipAt(position: number) {
        if (!position && position != 0) return;
        this.model.data.delete(position);
    }
}