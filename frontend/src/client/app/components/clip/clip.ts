import "./clip.css";
import {Card} from "../card/card";
import {define} from "turbodombuilder";
import {Timeline} from "../timeline/timeline";
import {ClipProperties, SyncedClip} from "./clip.types";
import {ClipView} from "./clip.view";
import {ClipModel} from "./clip.model";
import {SyncedMedia} from "../../managers/captureManager/captureManager.types";
import {ClipTextHandler} from "./clip.textHandler";
import {ClipThumbnailController} from "./clipThumbnailController";
import {VcComponent} from "../component/component";
import {DocumentManager} from "../../managers/documentManager/documentManager";

@define("vc-clip")
export class Clip extends VcComponent<ClipView, SyncedClip, ClipModel, DocumentManager> {
    public readonly timeline: Timeline;

    constructor(properties: ClipProperties) {
        super(properties);
        this.timeline = properties.timeline;
        this.mvc.generate({
            viewConstructor: ClipView,
            modelConstructor: ClipModel,
            data: properties.data,
            handlerConstructors: [ClipTextHandler],
            controllerConstructors: [ClipThumbnailController]
        });
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
}