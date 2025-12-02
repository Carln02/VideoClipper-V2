import {ClipTextHandler} from "./clip.textHandler";
import { SyncedText } from "../textElement/textElement.types";
import { SyncedMedia } from "../../handlers/mediaHandler/mediaHandler.types";
import {SyncedClip} from "./clip.types";
import {
    auto, blockSignal,
    deepObserveAny,
    Direction,
    handler,
    modelSignal,
    signal, TurboModel, TurboYBlock,
    YArray,
    YMap
} from "turbodombuilder";

export class ClipModel extends TurboModel {
    public static dataBlockConstructor = TurboYBlock;
    public readonly minimumDuration: number = 0.3 as const;

    @signal public orientation: Direction;

    @modelSignal() public backgroundFill: string;
    @modelSignal() public thumbnail: string;
    @modelSignal() public content: YArray<SyncedText>;
    @modelSignal() public color: string;
    @modelSignal() public hidden: boolean;
    @modelSignal() public muted: boolean;

    @modelSignal() @auto({
        preprocessValue: function(value: number) {
            if (this.videoDuration && value < 0) value = 0;
            if (value > this.endTime - this.minimumDuration) value = this.endTime - this.minimumDuration;
            return value;
        }
    }) public startTime: number;

    @modelSignal() @auto({
        preprocessValue: function(value: number) {
            if (value < this.startTime + this.minimumDuration) value = this.startTime + this.minimumDuration;
            if (this.videoDuration && value > this.videoDuration) value = this.videoDuration;
            return value;
        }
    }) public endTime: number;

    private _uri: string;
    private _videoDuration: number = null;

    @handler() public textHandler: ClipTextHandler;

    public get data(): SyncedClip & YMap {
        return super.data;
    }

    public set data(data: SyncedClip & YMap) {
        super.data = data;
        //TODO MAKE IT TOGGLEABLE
        deepObserveAny(this.data, () => this.fireCallback("reload_thumbnail"),
            "startTime", "endTime", "backgroundFill", "mediaId", "content");
    }

    @blockSignal() public metadata: TurboYBlock<SyncedMedia & YMap>;

    public get metadataType(): "image" | "video" {
        return this.metadata?.data?.get("type");
    }

    public get mediaId(): string {
        return this.metadata?.id;
    }

    public set blob(value: Blob) {
        this._uri = value ? URL.createObjectURL(value) : null;
        this._videoDuration = this.metadataType == "video" ? this.metadata?.data?.get("duration") : null;
    }

    public get uri(): string {
        return this._uri;
    }

    public get videoDuration(): number {
        return this._videoDuration;
    }

    public normalizeTime() {
        if (this.videoDuration) return;
        const oldStartTime = this.startTime;
        this.startTime = 0;
        this.endTime = this.endTime - oldStartTime;
    }
}