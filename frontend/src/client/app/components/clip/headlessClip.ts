import {Card} from "../card/card";
import {Coordinate, define, TurboDragEvent, TurboView} from "turbodombuilder";
import {Timeline} from "../timeline/timeline";
import {ClipModel} from "./clip.model";
import {ClipTextHandler} from "./clip.textHandler";
import {VcComponent} from "../component/component";
import {DocumentManager} from "../../managers/documentManager/documentManager";
import {TextElement} from "../textElement/textElement";
import {YMap} from "../../../../yManagement/yManagement.types";
import {YUtilities} from "../../../../yManagement/yUtilities";
import {randomColor} from "../../../utils/random";
import {SyncedText} from "../textElement/textElement.types";
import {MovableComponent} from "../basicComponents/movableComponent/movableComponent";
import {SyncedMedia} from "../../managers/mediaManager/mediaManager.types";
import {ClipProperties, SyncedClip} from "./clip.types";

@define("vc-clip-headless")
export class HeadlessClip<
    View extends TurboView = TurboView,
    Data extends SyncedClip = SyncedClip,
    Model extends ClipModel = ClipModel,
    Manager extends DocumentManager = DocumentManager
> extends VcComponent<View, Data, Model, Manager> {
    public readonly timeline: Timeline;

    public onMediaDataChanged: (clip: this) => void = () => {};

    public constructor(properties: ClipProperties<View, Data, Model, Manager>) {
        super(properties);
        this.timeline = properties.timeline;
        if (!properties.generate) return;

        this.mvc.generate({
            modelConstructor: ClipModel as any,
            data: properties.data,
            handlerConstructors: [ClipTextHandler]
        });

        this.mvc.emitter.add("mediaId", async (value: string) => {
            this.model.updateMediaData(await this.screenManager.MediaManager.getMedia(value));

            //TODO maybe remove this? idk
            // if (media.metadata?.thumbnail) {
            //     img({src: media.metadata?.thumbnail, parent: this.clipContent, classes: "thumbnail"});
            // }

            this.onMediaDataChanged(this)
        });

        this.mvc.emitter.add("startTime", () => this.timeline.reloadTime());
        this.mvc.emitter.add("endTime", () => this.timeline.reloadTime());
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
    public clone(): HeadlessClip {
        const clone = new HeadlessClip({timeline: this.timeline, data: this.data, screenManager: this.screenManager});
        clone.setStyle("width", this.offsetWidth + "px");
        clone.setStyle("height", this.offsetHeight + "px");
        clone.selected = this.selected;
        return clone;
    }

    public split(localSplitTime: number): YMap & SyncedClip {
        if (localSplitTime < this.startTime || localSplitTime > this.endTime) return;
        const newData = HeadlessClip.createData((this.data as any as YMap).toJSON());
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