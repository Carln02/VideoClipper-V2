import "./clip.css";
import {
    Coordinate,
    createYArray,
    createYMap,
    define,
    Direction,
    element,
    expose,
    turbo,
    TurboDragEvent,
    TurboView,
    YMap
} from "turbodombuilder";
import {Timeline} from "../timeline/timeline";
import {ClipProperties, SyncedClip} from "./clip.types";
import {ClipModel} from "./clip.model";
import {ClipThumbnailController} from "./clip.thumbnailController";
import {movable} from "../basicComponents/movableComponent/movableComponent";
import {ClipTextHandler} from "./clip.textHandler";
import {Card} from "../card/card";
import {TextElement} from "../textElement/textElement";
import {Project} from "../../directors/project/project";
import {VcComponent} from "../component/component";
import {randomColor} from "../../utils/random";
import {SyncedText} from "../textElement/textElement.types";
import {ClipView} from "./clip.view";
import {SyncedMedia} from "../../handlers/mediaHandler/mediaHandler.types";

@define("vc-clip")
export class Clip<
    View extends TurboView = TurboView,
    Model extends ClipModel = ClipModel,
> extends VcComponent<View, SyncedClip, Model, Project> {
    public timeline: Timeline;

    @expose("timeline", false) public accessor card: Card;

    @expose("model", false) public accessor mediaId: string;
    @expose("model", false) public accessor uri: string;
    @expose("model", false) public accessor metadata: SyncedMedia;
    @expose("model", false) public accessor metadataType: "image" | "video";

    @expose("model", false) public accessor videoDuration: number;
    @expose("model", false) public accessor backgroundFill: string;

    @expose("model") public accessor orientation: Direction;
    @expose("model") public accessor startTime: number;
    @expose("model") public accessor endTime: number;
    @expose("model") public accessor muted: boolean;
    @expose("model") public accessor hidden: boolean;

    public onMediaDataChanged: (clip: this) => void = () => {};

    public initialize() {
        super.initialize();
        this.mvc.emitter.add("mediaId", async (value: string) => {
            this.model.metadata = this.director.mediaHandler.getMediaMetadata(value) as any;
            this.model.metadata.id = value;
            this.model.blob = await this.director.mediaHandler.getMedia(value);
            this.onMediaDataChanged(this);
        });

        this.mvc.emitter.addWithBlock("convert", "metadata", async (value: string) => {
            if (!value) return;
            this.model.blob = await this.director.mediaHandler.getMedia(value);
        });

        requestAnimationFrame(() => {
            if (!this.model.thumbnail) this.mvc.emitter.fire("reload_thumbnail");
        });
    }

    public static createData(data?: SyncedClip): YMap & SyncedClip {
        if (!data) data = {content: [undefined]};
        if (!data.startTime) data.startTime = 0;
        if (!data.endTime) data.endTime = 5;
        if (!data.backgroundFill && !data.mediaId) data.backgroundFill = "#FFFFFF";
        if (!data.color) data.color = randomColor();

        const contentArray = createYArray([]);
        data.content?.forEach((content: SyncedText) => contentArray.push([TextElement.createData(content)]));
        data.content = contentArray;

        return createYMap<SyncedClip>(data);
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

    public get duration(): number {
        return this.model.endTime - this.model.startTime;
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
        const clone = clip({
            timeline: this.timeline,
            data: this.data,
            view: this.view?.constructor as any,
            director: this.director
        });

        turbo(clone).setStyles({width: this.offsetWidth + "px", height: this.offsetHeight + "px"});
        clone.selected = this.selected;
        return clone;
    }

    public split(localSplitTime: number): YMap & SyncedClip {
        if (localSplitTime < this.startTime || localSplitTime > this.endTime) return;
        const newData = Clip.createData((this.data as YMap).toJSON());
        newData.set("startTime", localSplitTime);
        newData.set("color", randomColor());
        this.endTime = localSplitTime;
        return newData;
    }

    public cloneAndMove(e: TurboDragEvent) {
        const clone = this.clone();
        turbo(this).setStyle("opacity", "0.4");

        const moveableClone = movable({clone, originElement: this,
            parent: this.director.canvas.content});
        moveableClone.translation = this.timeline.scaled ? e.scaledPosition : e.position;
        return moveableClone;
    }

    public delete() {
        this.card.removeClip(this);
    }
}

export function clip<
    View extends TurboView = TurboView,
    Model extends ClipModel = ClipModel,
>(properties: ClipProperties<View, SyncedClip, Model>): Clip<View, Model> {
    turbo(properties).applyDefaults({
        tag: "vc-clip",
        model: ClipModel as any,
        handlers: ClipTextHandler,
        controllers: ClipThumbnailController
    });
    return element({...properties}) as Clip<View, Model>;
}