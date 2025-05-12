import "./clip.css";
import {define, TurboDragEvent} from "turbodombuilder";
import {Timeline} from "../timeline/timeline";
import {ClipProperties} from "./clip.types";
import {ClipView} from "./clip.view";
import {ClipModel} from "./clip.model";
import {ClipThumbnailController} from "./clipThumbnailController";
import {MovableComponent} from "../basicComponents/movableComponent/movableComponent";
import {ClipHeadless} from "./clip.headless";
import {ClipTextHandler} from "./clip.textHandler";

@define("vc-clip")
export class Clip extends ClipHeadless<ClipView> {
    public readonly timeline: Timeline;

    public onMediaDataChanged: (clip: this) => void = () => {};

    public constructor(properties: ClipProperties<ClipView>) {
        super({...properties, generate: false});
        this.timeline = properties.timeline;
        this.mvc.generate({
            viewConstructor: ClipView,
            modelConstructor: ClipModel,
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
        this.view.showHandles(value);
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
        moveableClone.translation = this.timeline.scaled ? e.scaledPosition : e.position;
        return moveableClone;
    }
}