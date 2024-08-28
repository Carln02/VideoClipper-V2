import {SyncedClip, SyncedClipData} from "./clip.types";
import "./clip.css";
import {get_video} from "../../../sync/videostore";
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
import {randomColor} from "../../../utils/random";
import {SyncedComponent} from "../../abstract/syncedComponent/syncedComponent";
import {YWrapObserver} from "../../abstract/syncedComponent/syncedComponent.types";
import {Timeline} from "../timeline/timeline";
import {ClipRenderer} from "../clipRenderer/clipRenderer";
import domToImage from "dom-to-image-more";
import {SyncedText, TextType} from "../textElement/textElement.types";
import {TextElement} from "../textElement/textElement";
import {SyncedMedia} from "../../views/camera/manager/captureManager/captureManager.types";

@define("vc-clip")
export class Clip extends SyncedComponent<SyncedClip> implements YWrapObserver<SyncedClip> {
    private static renderer: ClipRenderer;
    private static rendererInitialized = false;

    public metadata: SyncedMedia;
    public uri: string;
    private videoDuration: number = null;

    private readonly clipContent: HTMLDivElement;
    private readonly thumbnailImage: HTMLImageElement;

    private leftHandle: HTMLDivElement;
    private rightHandle: HTMLDivElement;

    private readonly minimumDuration: number = 0.3 as const;

    constructor(data: SyncedClip, properties: TurboProperties = {}) {
        super(properties);
        this.clipContent = div({classes: "vc-clip-content", parent: this});
        this.thumbnailImage = img({src: "", parent: this.clipContent, classes: "thumbnail"});
        this.thumbnailImage.show(false);

        if (!data.color) data.color = randomColor();
        this.data = data;
    }

    /**
     * @function create
     * @static
     * @description Creates a new clip in the Yjs document from the provided data and in the card with the provided ID.
     * @param {SyncedClipData} data - The provided data.
     * @param {string} cardId - The ID of the card to which the clip will be added.
     * @param {number} [index] - Optional index to specify the position of the clip in the card's syncedClips array.
     * By default, the clip will be pushed to the end of the array.
     * @returns {number} - The index of the created clip in the card's syncedClips array, or -1 if an issue occurred.
     */
    public static create(data: SyncedClipData, cardId: string, index?: number): number {
        const cardClips = this.root.cards[cardId]?.syncedClips;
        if (!cardClips) return -1;
        return super.createInArray(data, cardClips, index);
    }

    /**
     * @function initializeSnapshotRenderer
     * @private
     * @static
     * @description If not already created, creates a new static renderer used to take snapshots of clips and generate
     * thumbnails.
     */
    private static initializeSnapshotRenderer() {
        if (this.rendererInitialized) return;
        this.renderer = new ClipRenderer({parent: document.body, id: "snapshot-renderer"},
            {muted: true, playsInline: true});
        this.rendererInitialized = true;
    }

    //Update data

    /**
     * @function addText
     * @description Adds a new text entry in the current clip data at the provided position.
     * @param {Point | Coordinate} position - The position of the text's anchor point on the clip in percentage
     * (between 0 and 1).
     */
    public addText(position: Point | Coordinate) {
        this.data.content?.push({
            text: "Text",
            type: TextType.custom,
            origin: position instanceof Point ? position.object : position,
            fontSize: 0.1
        } as unknown as SyncedText);
    }

    /**
     * @function removeText
     * @description Removes the provided text element from the HTML document and the Yjs document.
     * @param {TextElement} entry - The text element to remove.
     */
    public removeText(entry: TextElement) {
        const index = this.data.content?.indexOf(entry.data);
        if (index < 0) return;
        entry.data.destroy_observers();
        this.data.content?.splice(index, 1);
    }

    /**
     * @function removeTextAt
     * @description Removes the text entry at the provided index in the clip's content.
     * @param {number} index - The index of the text to remove.
     */
    public removeTextAt(index: number) {
        if (index < 0 || index >= this.data.content?.length) return;
        this.data.content[index].destroy_observers();
        this.data.content?.splice(index, 1);
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

    public get timeline(): Timeline {
        for (const observer of this.data.get_parent().get_observers()) {
            if (!(observer instanceof Timeline)) continue;
            if (observer.clips.includes(this)) return observer;
        }
        return;
    }

    public get card(): Card {
        return this.timeline?.card;
    }

    public get startTime(): number {
        return this.data.startTime;
    }

    public set startTime(value: number) {
        if (this.videoDuration && value < 0) value = 0;
        if (value > this.endTime - this.minimumDuration) value = this.endTime - this.minimumDuration;
        this.data.startTime = value;
    }

    public get endTime(): number {
        return this.data.endTime;
    }

    public set endTime(value: number) {
        if (value < this.startTime + this.minimumDuration) value = this.startTime + this.minimumDuration;
        if (this.videoDuration && value > this.videoDuration) value = this.videoDuration;
        this.data.endTime = value;
    }

    private get pixelsPerSecondUnit(): number {
        return this.card?.timeline.pixelsPerSecondUnit;
    }

    public get duration() {
        return this.endTime - this.startTime;
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

    public onColorUpdated(value: string) {
        this.clipContent.setStyle("backgroundColor", value);
    }

    public onStartTimeUpdated() {
        this.reloadSize();
    }

    public onEndTimeUpdated() {
        this.reloadSize();
    }

    private normalizeTime() {
        if (this.videoDuration) return;
        const oldStartTime = this.startTime;
        this.startTime = 0;
        this.endTime = this.endTime - oldStartTime;
    }

    public onMediaIdUpdated(value: number) {
        const media = get_video(value);

        this.metadata = media?.metadata ?? null;
        this.uri = media?.uri ?? null;
        this.videoDuration = media?.metadata?.type == "video" ? media.metadata.duration : null;

        //TODO maybe remove this? idk
        // if (media.metadata?.thumbnail) {
        //     img({src: media.metadata?.thumbnail, parent: this.clipContent, classes: "thumbnail"});
        // }
    }

    public onHiddenUpdated(value: boolean) {
        this.toggleClass("hidden-clip", value);
    }

    public onThumbnailUpdated(value: string) {
        this.thumbnailImage.show(true);
        this.thumbnailImage.src = value;
    }

    public onChanged(newValue: unknown, local: boolean, path: (string | number)[]) {
        if ((path && path[0] == "thumbnail") || !local) return;
        this.reloadThumbnail();
    }

    //Utilities

    /**
     * @function reloadSize
     * @description Reloads the size of the clip element and thus, reloads as well the timeline.
     */
    public reloadSize() {
        this.setStyle("width", this.pixelsPerSecondUnit * this.duration + "px");
        this.card?.timeline.reloadTime();
    }

    /**
     * @function clone
     * @description Creates a clone of this clip.
     * @returns {Clip} - The clone.
     */
    public clone(): Clip {
        const clone = new Clip(this.data);
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
        Clip.initializeSnapshotRenderer();
        await Clip.renderer.setFrame(this, offset, false, true);

        const image = await domToImage.toJpeg(Clip.renderer, {quality: 0.6});
        this.data.thumbnail = image;
        return image;
    }
}
