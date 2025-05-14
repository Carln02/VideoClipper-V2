import "./clip.css";
import {Coordinate, define, TurboDragEvent, TurboView} from "turbodombuilder";
import {Timeline} from "../timeline/timeline";
import {ClipProperties, SyncedClip} from "./clip.types";
import {ClipModel} from "./clip.model";
import {ClipThumbnailController} from "./clipThumbnailController";
import {MovableComponent} from "../basicComponents/movableComponent/movableComponent";
import {ClipTextHandler} from "./clip.textHandler";
import {Card} from "../card/card";
import {SyncedMedia} from "../../managers/mediaManager/mediaManager.types";
import {TextElement} from "../textElement/textElement";
import {YMap} from "../../../../yManagement/yManagement.types";
import {DocumentManager} from "../../managers/documentManager/documentManager";
import {VcComponent} from "../component/component";
import {randomColor} from "../../../utils/random";
import {YUtilities} from "../../../../yManagement/yUtilities";
import {SyncedText} from "../textElement/textElement.types";
import {ClipView} from "./clip.view";

@define("vc-clip")
export class Clip<
    View extends TurboView = TurboView,
    Model extends ClipModel = ClipModel,
> extends VcComponent<View, SyncedClip, Model, DocumentManager>  {
    public readonly timeline: Timeline;

    public onMediaDataChanged: (clip: this) => void = () => {};

    public constructor(properties: ClipProperties<View, SyncedClip, Model>) {
        super({...properties, generate: false});
        this.timeline = properties.timeline;
        this.mvc.generate({
            viewConstructor: properties.viewConstructor,
            modelConstructor: ClipModel as unknown as new () => Model,
            data: properties.data,
            handlerConstructors: [ClipTextHandler],
            controllerConstructors: [ClipThumbnailController]
        });

        this.mvc.emitter.add("mediaId", async (value: string) => {
            this.model.updateMediaData(await this.screenManager.MediaManager.getMedia(value));

            //TODO maybe remove this? idk
            // if (media.metadata?.thumbnail) {
            //     img({src: media.metadata?.thumbnail, parent: this.clipContent, classes: "thumbnail"});
            // }

            this.onMediaDataChanged(this);
        });
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

    /**
     * @description Whether the element is selected or not. Setting it will accordingly toggle the "selected" CSS
     * class on the element and update the UI.
     */
    public get selected(): boolean {
        return super.selected;
    }

    public set selected(value: boolean) {
        super.selected = value;
        if (this.view && this.view instanceof ClipView) this.view?.showHandles(value);
    }

    public get card(): Card {
        return this.timeline.card;
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
     * @returns {HeadlessClip} - The clone.
     */
    public clone(): Clip {
        const clone = new Clip({
            timeline: this.timeline,
            data: this.data,
            viewConstructor: this.view?.constructor as any,
            screenManager: this.screenManager
        });

        clone.setStyle("width", this.offsetWidth + "px");
        clone.setStyle("height", this.offsetHeight + "px");
        clone.selected = this.selected;
        return clone;
    }

    public split(localSplitTime: number): YMap & SyncedClip {
        if (localSplitTime < this.startTime || localSplitTime > this.endTime) return;
        const newData = Clip.createData((this.data as any as YMap).toJSON());
        newData.set("startTime", localSplitTime);
        this.endTime = localSplitTime;
        return newData;
    }

    public cloneAndMove(e: TurboDragEvent) {
        const clone = this.clone();
        this.setStyle("opacity", "0.4");

        const moveableClone = new MovableComponent(clone, this, {parent: this.screenManager.canvas.content});
        moveableClone.translation = this.timeline.scaled ? e.scaledPosition : e.position;
        return moveableClone;
    }
}