import {YUtilities} from "../../../yManagement/yUtilities";
import {YComponentModel} from "../../../yManagement/yModel/types/yComponentModel";
import {ClipTextHandler} from "./clip.textHandler";
import { YArray, YMap } from "../../../yManagement/yManagement.types";
import { SyncedText } from "../textElement/textElement.types";
import { SyncedMedia } from "../../handlers/mediaHandler/mediaHandler.types";
import {SyncedClip} from "./clip.types";
import { auto, Direction } from "turbodombuilder";

export class ClipModel extends YComponentModel {
    private _uri: string;
    private _videoDuration: number = null;

    public readonly minimumDuration: number = 0.3 as const;

    public get data(): SyncedClip & YMap {
        return super.data;
    }

    public set data(data: SyncedClip & YMap) {
        super.data = data;
        //TODO MAKE IT TOGGLEABLE
        YUtilities.deepObserveAny(this.data, () => this.fireCallback("reload_thumbnail"),
            "startTime", "endTime", "backgroundFill", "mediaId", "content");
    }

    public get metadata(): SyncedMedia & YMap {
        return this.getBlock("metadata")?.data;
    }

    public setMetadata(value: SyncedMedia & YMap, id?: string) {
        this.setBlock(value, id, "metadata");
    }

    public get metadataType(): "image" | "video" {
        return this.metadata?.get("type");
    }

    public set blob(value: Blob) {
        this._uri = value ? URL.createObjectURL(value) : null;
        this._videoDuration = this.metadataType == "video" ? this.metadata?.get("duration") : null;
    }

    public get uri(): string {
        return this._uri;
    }

    public get videoDuration(): number {
        return this._videoDuration;
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
        return this.getBlockId("metadata");
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

    @auto()
    public set orientation(value: Direction) {
        this.fireCallback("orientationChanged", value);
    }
}