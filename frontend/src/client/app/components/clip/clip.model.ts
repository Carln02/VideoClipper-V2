import {YUtilities} from "../../../../yManagement/yUtilities";
import {SyncedMedia} from "../../managers/mediaManager/mediaManager.types";
import {YComponentModel} from "../../../../yManagement/yModel/types/yComponentModel";
import {ClipTextHandler} from "./clip.textHandler";
import { YArray } from "../../../../yManagement/yManagement.types";
import { SyncedText } from "../textElement/textElement.types";

export class ClipModel extends YComponentModel {
    private _metadata: SyncedMedia;
    private _uri: string;
    private _videoDuration: number = null;

    public readonly minimumDuration: number = 0.3 as const;

    public get data(): any {
        return super.data;
    }

    public set data(value: any) {
        super.data = value;
        //TODO MAKE IT TOGGLEABLE
        YUtilities.deepObserveAny(this.data, () => this.fireCallback("reload_thumbnail"),
            "startTime", "endTime", "backgroundFill", "mediaId", "content");
    }

    public get metadata(): SyncedMedia {
        return this._metadata;
    }

    public get uri(): string {
        return this._uri;
    }

    public get videoDuration(): number {
        return this._videoDuration;
    }

    public async updateMediaData(media: SyncedMedia) {
        this._metadata = media;

        if (media?.blob instanceof Blob) this._uri = URL.createObjectURL(media.blob);
        else this._uri = null;

        this._videoDuration = media?.type == "video" ? media?.duration : null;
    }

    public get startTime(): number {
        return this.getData("startTime") as number;
    }

    public set startTime(value: number) {
        if (this.videoDuration && value < 0) value = 0;
        if (value > this.endTime - this.minimumDuration) value = this.endTime - this.minimumDuration;
        this.setData("startTime", value);
    }

    public get endTime(): number {
        return this.getData("endTime") as number;
    }

    public set endTime(value: number) {
        if (value < this.startTime + this.minimumDuration) value = this.startTime + this.minimumDuration;
        if (this.videoDuration && value > this.videoDuration) value = this.videoDuration;
        this.setData("endTime", value);
    }

    public normalizeTime() {
        if (this.videoDuration) return;
        const oldStartTime = this.startTime;
        this.startTime = 0;
        this.endTime = this.endTime - oldStartTime;
    }

    public get backgroundFill(): string {
        return this.getData("backgroundFill") as string;
    }

    public set backgroundFill(value: string) {
        this.setData("backgroundFill", value);
    }

    public get mediaId(): string {
        return this.getData("mediaId") as string;
    }

    public set mediaId(value: string) {
        this.setData("mediaId", value);
    }

    public get thumbnail(): string {
        return this.getData("thumbnail") as string;
    }

    public set thumbnail(value: string) {
        this.setData("thumbnail", value);
    }

    public get content(): YArray<SyncedText> {
        return this.getData("content") as YArray<SyncedText>;
    }

    public set content(value: YArray<SyncedText>) {
        this.setData("content", value);
    }

    public get color(): string {
        return this.getData("color") as string;
    }

    public set color(value: string) {
        this.setData("color", value);
    }

    public get hidden(): boolean {
        return this.getData("hidden") as boolean;
    }

    public set hidden(value: boolean) {
        this.setData("hidden", value);
    }

    public get muted(): boolean {
        return this.getData("muted") as boolean;
    }

    public set muted(value: boolean) {
        this.setData("muted", value);
    }

    public get textHandler(): ClipTextHandler {
        return this.getHandler("text") as ClipTextHandler;
    }
}