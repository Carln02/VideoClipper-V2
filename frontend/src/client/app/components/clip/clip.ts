import "./clip.css";
import {Card} from "../card/card";
import {Coordinate, define, TurboDragEvent} from "turbodombuilder";
import {Timeline} from "../timeline/timeline";
import {ClipProperties, SyncedClip} from "./clip.types";
import {ClipView} from "./clip.view";
import {ClipModel} from "./clip.model";
import {ClipTextHandler} from "./clip.textHandler";
import {ClipThumbnailController} from "./clipThumbnailController";
import {VcComponent} from "../component/component";
import {DocumentManager} from "../../managers/documentManager/documentManager";
import {TextElement} from "../textElement/textElement";
import {YMap} from "../../../../yManagement/yManagement.types";
import {YUtilities} from "../../../../yManagement/yUtilities";
import {randomColor} from "../../../utils/random";
import {SyncedText} from "../textElement/textElement.types";
import {MovableComponent} from "../basicComponents/movableComponent/movableComponent";
import {SyncedMedia} from "../../managers/mediaManager/mediaManager.types";

@define("vc-clip")
export class Clip extends VcComponent<ClipView, SyncedClip, ClipModel, DocumentManager> {
    public readonly timeline: Timeline;

    public onMediaDataChanged: (clip: this) => void = () => {};

    public constructor(properties: ClipProperties) {
        super(properties);
        this.timeline = properties.timeline;
        this.mvc.generate({
            viewConstructor: ClipView,
            modelConstructor: ClipModel,
            data: properties.data,
            handlerConstructors: [ClipTextHandler],
            controllerConstructors: [ClipThumbnailController]
        });

        this.mvc.emitter.add("mediaDataChanged", () => this.onMediaDataChanged(this));
    }

    public static createData(data?: SyncedClip): YMap & SyncedClip {
        if (!data) data = {content: [undefined]};
        if (!data.startTime) data.startTime = 0;
        if (!data.endTime) data.endTime = 5;
        if (!data.backgroundFill && !data.mediaId) data.backgroundFill = "#FFFFFF";
        if (!data.color) data.color = randomColor();

        const contentArray = YUtilities.createYArray([]);
        data.content?.forEach((content: SyncedText) => contentArray.push([TextElement.createData(content)]));
        data.content = contentArray;

        return YUtilities.createYMap<SyncedClip>(data);
    }

    //Getters and setters

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

    public get muted(): boolean {
        return this.model.muted;
    }

    public set muted(value: boolean) {
        this.model.muted = value;
    }

    public get hidden(): boolean {
        return this.model.hidden;
    }

    public set hidden(value: boolean) {
        this.model.hidden = value;
    }

    public addText(position: Coordinate) {
        return this.model.textHandler.addText(position);
    }

    public removeText(entry: TextElement) {
        this.model.textHandler.removeText(entry);
    }

    /**
     * @function clone
     * @description Creates a clone of this clip.
     * @returns {Clip} - The clone.
     */
    public clone(): Clip {
        const clone = new Clip({timeline: this.timeline, data: this.data, screenManager: this.screenManager});
        clone.setStyle("width", this.offsetWidth + "px");
        clone.setStyle("height", this.offsetHeight + "px");
        clone.selected = this.selected;
        return clone;
    }

    public cloneAndMove(e: TurboDragEvent) {
        const clone = this.clone();
        this.setStyle("opacity", "0.4");

        const moveableClone = new MovableComponent(clone, this, {parent: this.screenManager.canvas.content});
        moveableClone.translation = e.scaledPosition;
        return moveableClone;
    }
}