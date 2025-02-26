import "./clip.css";
import {Card} from "../card/card";
import {Coordinate, define, Point, TurboElement} from "turbodombuilder";
import {Timeline} from "../timeline/timeline";
import {ClipRenderer} from "../clipRenderer/clipRenderer";
import domToImage from "dom-to-image-more";
import {TextType} from "../textElement/textElement.types";
import {TextElement} from "../textElement/textElement";
import {ClipProperties, SyncedClip} from "./clip.types";
import {ClipView} from "./clip.view";
import {ClipModel} from "./clip.model";
import {YUtilities} from "../../../../yManagement/yUtilities";
import {SyncedMedia} from "../../views/camera/manager/captureManager/captureManager.types";

@define("vc-clip")
export class Clip extends TurboElement<ClipView, SyncedClip, ClipModel> {
    private static renderer: ClipRenderer;
    private static rendererInitialized = false;

    private _timeline: Timeline;

    constructor(properties: ClipProperties) {
        super(properties);
        this.timeline = properties.timeline;
        console.log(properties.data);
        this.generateMvc(ClipView, ClipModel, properties.data);
    }

    //Getters and setters

    protected set timeline(value: Timeline) {
        this._timeline = value;
    }

    public get timeline(): Timeline {
        return this._timeline;
    }

    public get card(): Card {
        return this.timeline.card;
    }

    /**
     * @description Whether the element is selected or not. Setting it will accordingly toggle the "selected" CSS
     * class on the element and update the UI.
     */
    public get selected(): boolean {
        return super.selected;
    }

    public set selected(value: boolean) {
        super.selected = value;
        this.view.showHandles(value);
    }

    public get uri(): string {
        return this.model.uri;
    }

    public get metadata(): SyncedMedia {
        return this.model.metadata;
    }

    public get videoDuration(): number {
        return this.model.videoDuration;
    }

    public get backgroundFill(): string {
        return this.model.backgroundFill;
    }

    public get mediaId(): string {
        return this.model.mediaId;
    }

    public get startTime(): number {
        return this.model.startTime;
    }

    public set startTime(value: number) {
        this.model.startTime = value;
    }

    public get endTime(): number {
        return this.model.endTime;
    }

    public set endTime(value: number) {
        this.model.endTime = value;
    }

    public get duration(): number {
        return this.endTime - this.startTime;
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
        Clip.renderer = new ClipRenderer({
            parent: document.body,
            id: "snapshot-renderer",
            videoProperties: {muted: true, playsInline: true}
        });
        Clip.rendererInitialized = true;
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
        }, this.model.content);
    }

    /**
     * @function removeText
     * @description Removes the provided text element from the HTML document and the Yjs document.
     * @param {TextElement} entry - The text element to remove.
     */
    public removeText(entry: TextElement) {
        if (!YUtilities.removeFromYArray(entry, this.model.content)) return;
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
        if (index < 0 || index >= this.model.content.length) return;
        this.model.content.delete(index);
        // this.data.content[index].destroyBoundObjects();
        // this.data.content?.splice(index, 1);
    }

    //Utilities

    /**
     * @function clone
     * @description Creates a clone of this clip.
     * @returns {Clip} - The clone.
     */
    public clone(): Clip {
        const clone = new Clip({timeline: this.timeline, data: this.data});
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
        this.model.thumbnail = image;
        return image;
    }
}