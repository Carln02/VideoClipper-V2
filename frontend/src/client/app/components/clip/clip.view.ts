import {YView} from "../../../../yManagement/yMvc/yView";
import {ClipModel} from "./clip.model";
import {Clip} from "./clip";
import {DefaultEventName, div, icon, img, TurboDragEvent} from "turbodombuilder";
import {ContextManager} from "../../managers/contextManager/contextManager";
import {ContextView} from "../../managers/contextManager/contextManager.types";

export class ClipView extends YView<Clip, ClipModel> {
    private clipContent: HTMLDivElement;
    private thumbnailImage: HTMLImageElement;

    private leftHandle: HTMLDivElement;
    private rightHandle: HTMLDivElement;

    public constructor(element: Clip) {
        super(element);

        this.clipContent = div({classes: "vc-clip-content"});
        this.thumbnailImage = img({src: "", classes: "thumbnail"}).show(false);
    }

    /**
     * @function reloadSize
     * @description Reloads the size of the clip element and thus, reloads as well the timeline.
     */
    public reloadSize() {
        this.element.setStyle("width", this.element.timeline?.pixelsPerSecondUnit * this.model.duration + "px");
        // this.timeline.reloadTime();
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
        this.model.updateMediaData(value);

        //TODO maybe remove this? idk
        // if (media.metadata?.thumbnail) {
        //     img({src: media.metadata?.thumbnail, parent: this.clipContent, classes: "thumbnail"});
        // }
    }

    public hiddenChanged(value: boolean) {
        this.element.toggleClass("hidden-clip", value);
    }

    public thumbnailChanged(value: string) {
        this.thumbnailImage.show(true);
        this.thumbnailImage.src = value;
    }

    protected setupUIElements() {
        this.clipContent = div({classes: "vc-clip-content"});
        this.thumbnailImage = img({src: "", parent: this.clipContent, classes: "thumbnail"});
        this.thumbnailImage.show(false);
    }

    protected setupUILayout() {
        this.element.addChild(this.clipContent);
        this.clipContent.addChild(this.thumbnailImage);
    }

    private generateHandles() {
        this.leftHandle = div({classes: "clip-handle-left", children: icon({icon: "chevron-left"})});
        this.rightHandle = div({classes: "clip-handle-right", children: icon({icon: "chevron-right"})});

        this.generateHandleEvents(this.leftHandle, "left");
        this.generateHandleEvents(this.rightHandle, "right");
    }

    private generateHandleEvents(handle: HTMLDivElement, side: "left" | "right") {
        handle.addEventListener(DefaultEventName.dragStart, (e: TurboDragEvent) => e.stopImmediatePropagation());
        handle.addEventListener(DefaultEventName.drag, (e: TurboDragEvent) => this.dragHandle(side, e));
        handle.addEventListener(DefaultEventName.dragEnd, () => this.model.normalizeTime());
    }

    private dragHandle(side: "left" | "right", e: TurboDragEvent) {
        e.stopImmediatePropagation();
        const delta = (ContextManager.instance.view == ContextView.canvas ? e.scaledDeltaPosition.x
            : e.deltaPosition.x) / this.element.timeline?.pixelsPerSecondUnit;
        if (side == "left") this.model.startTime += delta;
        else this.model.endTime += delta;
    }

    public showHandles(b: boolean) {
        if (!this.leftHandle) {
            if (!b) return;
            this.generateHandles();
        }

        if (b) this.element.addChild([this.leftHandle, this.rightHandle, this.clipContent]);
        else if (this.leftHandle.parentElement) this.element.removeChild([this.leftHandle, this.rightHandle]);
    }
}