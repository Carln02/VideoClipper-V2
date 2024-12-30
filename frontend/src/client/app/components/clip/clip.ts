import "./clip.css";
import {ContextManager} from "../../managers/contextManager/contextManager";
import {ContextView} from "../../managers/contextManager/contextManager.types";
import {Card} from "../card/card";
import {
    Coordinate,
    DefaultEventName,
    define,
    div,
    icon,
    img,
    Point,
    TurboDragEvent,
    TurboProperties
} from "turbodombuilder";
import {Timeline} from "../timeline/timeline";
import {ClipRenderer} from "../clipRenderer/clipRenderer";
import domToImage from "dom-to-image-more";
import {SyncedText, TextType} from "../textElement/textElement.types";
import {TextElement} from "../textElement/textElement";
import {SyncedMedia} from "../../views/camera/manager/captureManager/captureManager.types";
import {YComponent} from "../../yjsManagement/yComponent";
import {SyncedClip} from "./clip.types";
import {YArray, YMapEvent} from "../../../../yProxy/yProxy/types/base.types";
import {YUtilities} from "../../yjsManagement/yUtilities";
import {get_video} from "../../../sync/videostore";

@define("vc-clip")
export class Clip extends YComponent<SyncedClip> {
    private static renderer: ClipRenderer;
    private static rendererInitialized = false;

    private _timeline: Timeline;

    public metadata: SyncedMedia;
    public uri: string;
    private videoDuration: number = null;

    private readonly clipContent: HTMLDivElement;
    private readonly thumbnailImage: HTMLImageElement;

    private leftHandle: HTMLDivElement;
    private rightHandle: HTMLDivElement;

    private readonly minimumDuration: number = 0.3 as const;

    constructor(timeline: Timeline, data: SyncedClip, properties: TurboProperties = {}) {
        super(properties);
        this.timeline = timeline;

        this.clipContent = div({classes: "vc-clip-content", parent: this});
        this.thumbnailImage = img({src: "", parent: this.clipContent, classes: "thumbnail"});
        this.thumbnailImage.show(false);

        this.data = data;

        this.data.observeDeep(events => {
            let relevantChanges = false;

            for (const event of events) {
                if (!(event instanceof YMapEvent)) continue;
                for (const [key] of event.changes.keys) {
                    if (!["startTime", "endTime", "backgroundFill", "mediaId", "content"].includes(key)) continue;
                    relevantChanges = true;
                    break;
                }
                if (relevantChanges) break;
            }

            if (relevantChanges) this.reloadThumbnail();
        });
    }

    /**
     * @function initializeSnapshotRenderer
     * @private
     * @static
     * @description If not already created, creates a new static renderer used to take snapshots of clips and generate
     * thumbnails.
     */
    private initializeSnapshotRenderer() {
        if (Clip.rendererInitialized) return;
        Clip.renderer = new ClipRenderer({parent: document.body, id: "snapshot-renderer"},
            {muted: true, playsInline: true});
        Clip.rendererInitialized = true;
    }

    public colorChanged(value: string) {
        this.clipContent.setStyle("backgroundColor", value);
    }

    public startTimeChanged() {
        this.reloadSize();
    }

    public endTimeChanged() {
        this.reloadSize()
    }

    public mediaIdChanged(value: string) {
        const media = get_video(value);

        this.metadata = media?.metadata ?? null;
        this.uri = media?.uri ?? null;
        this.videoDuration = media?.metadata?.type == "video" ? media.metadata.duration : null;

        //TODO maybe remove this? idk
        // if (media.metadata?.thumbnail) {
        //     img({src: media.metadata?.thumbnail, parent: this.clipContent, classes: "thumbnail"});
        // }
    }

    public hiddenChanged(value: boolean) {
        this.toggleClass("hidden-clip", value);
    }

    public thumbnailChanged(value: string) {
        this.thumbnailImage.show(true);
        this.thumbnailImage.src = value;
    }

    /**
     * @function addText
     * @description Adds a new text entry in the current clip data at the provided position.
     * @param {Point | Coordinate} position - The position of the text's anchor point on the clip in percentage
     * (between 0 and 1).
     */
    public addText(position: Point | Coordinate) {
        YUtilities.addInYArray({
            text: "Text",
            type: TextType.custom,
            origin: position instanceof Point ? position.object : position,
            fontSize: 0.1
        }, this.content);
    }

    /**
     * @function removeText
     * @description Removes the provided text element from the HTML document and the Yjs document.
     * @param {TextElement} entry - The text element to remove.
     */
    public removeText(entry: TextElement) {
        if (!YUtilities.removeFromYArray(entry, this.content)) return;
        // const index = this.content?.indexOf(entry.data);
        // if (index < 0) return;
        // entry.data.destroyBoundObjects();
        // this.data.content?.splice(index, 1);
    }

    /**
     * @function removeTextAt
     * @description Removes the text entry at the provided index in the clip's content.
     * @param {number} index - The index of the text to remove.
     */
    public removeTextAt(index: number) {
        if (index < 0 || index >= this.content.length) return;
        this.content.delete(index);
        // this.data.content[index].destroyBoundObjects();
        // this.data.content?.splice(index, 1);
    }

    //UI

    private generateHandles() {
        this.leftHandle = div({classes: "clip-handle-left", children: icon({icon: "chevron-left"})});
        this.rightHandle = div({classes: "clip-handle-right", children: icon({icon: "chevron-right"})});

        this.generateHandleEvents(this.leftHandle, "left");
        this.generateHandleEvents(this.rightHandle, "right");
    }

    private generateHandleEvents(handle: HTMLDivElement, side: "left" | "right") {
        handle.addEventListener(DefaultEventName.dragStart, (e: TurboDragEvent) => e.stopImmediatePropagation());
        handle.addEventListener(DefaultEventName.drag, (e: TurboDragEvent) => this.dragHandle(side, e));
        handle.addEventListener(DefaultEventName.dragEnd, () => this.normalizeTime());
    }

    private dragHandle(side: "left" | "right", e: TurboDragEvent) {
        e.stopImmediatePropagation();
        const delta = (ContextManager.instance.view == ContextView.canvas ? e.scaledDeltaPosition.x
            : e.deltaPosition.x) / this.pixelsPerSecondUnit;
        if (side == "left") this.startTime += delta;
        else this.endTime += delta;
    }

    private showHandles(b: boolean) {
        if (!this.leftHandle) {
            if (!b) return;
            this.generateHandles();
        }

        if (b) this.addChild([this.leftHandle, this.rightHandle, this.clipContent]);
        else if (this.leftHandle.parentElement) this.removeChild([this.leftHandle, this.rightHandle]);
    }

    //Getters and setters

    private set timeline(value: Timeline) {
        this._timeline = value;
    }
    public get timeline(): Timeline {
        return this._timeline;
    }

    public get card(): Card {
        return this.timeline.card;
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

    private get pixelsPerSecondUnit(): number {
        return this.timeline?.pixelsPerSecondUnit;
    }

    public get duration() {
        return this.endTime - this.startTime;
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

    /**
     * @description Whether the element is selected or not. Setting it will accordingly toggle the "selected" CSS
     * class on the element and update the UI.
     */
    public set selected(value: boolean) {
        super.selected = value;
        this.showHandles(value);
    }

    //Callbacks

    private normalizeTime() {
        if (this.videoDuration) return;
        const oldStartTime = this.startTime;
        this.startTime = 0;
        this.endTime = this.endTime - oldStartTime;
    }

    //Utilities

    /**
     * @function reloadSize
     * @description Reloads the size of the clip element and thus, reloads as well the timeline.
     */
    public reloadSize() {
        this.setStyle("width", this.pixelsPerSecondUnit * this.duration + "px");
        // this.timeline.reloadTime();
    }

    /**
     * @function clone
     * @description Creates a clone of this clip.
     * @returns {Clip} - The clone.
     */
    public clone(): Clip {
        const clone = new Clip(this.timeline, this.data);
        clone.setStyle("width", this.offsetWidth + "px");
        clone.setStyle("height", this.offsetHeight + "px");
        clone.selected = this.selected;
        return clone;
    }

    /**
     * @function reloadThumbnail
     * @async
     * @description Regenerates the thumbnail of the current clip.
     * @param {number} [offset] - Optionally specify the timestamp from which the thumbnail should be generated.
     * @returns {Promise<string>} - A base64 string of the image output.
     */
    public async reloadThumbnail(offset: number = 0): Promise<string> {
        this.initializeSnapshotRenderer();
        await Clip.renderer.setFrame(this, offset, false, true);

        const image = await domToImage.toJpeg(Clip.renderer, {quality: 0.6});
        this.data.thumbnail = image;
        return image;
    }
}
