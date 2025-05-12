import {ClipModel} from "./clip.model";
import {Clip} from "./clip";
import {DefaultEventName, div, icon, img, TurboDragEvent, TurboView} from "turbodombuilder";

export class ClipView extends TurboView<Clip, ClipModel> {
    private clipContent: HTMLDivElement;
    private thumbnailImage: HTMLImageElement;

    private leftHandle: HTMLDivElement;
    private rightHandle: HTMLDivElement;

    /**
     * @function reloadSize
     * @description Reloads the size of the clip element and thus, reloads as well the timeline.
     */
    private reloadSize() {
        this.element.setStyle("width", this.element.timeline?.pixelsPerSecondUnit * this.element.duration + "px");
        this.element.timeline.reloadSize();
    }

    protected setupChangedCallbacks() {
        super.setupChangedCallbacks();

        this.emitter.add("color", (value: string) => this.clipContent.setStyle("backgroundColor", value));
        this.emitter.add("startTime", () => this.reloadSize());
        this.emitter.add("endTime", () => this.reloadSize());

        this.emitter.add("hidden", (value: boolean) => this.element.toggleClass("hidden-clip", value));
        this.emitter.add("thumbnail", (value: string) => {
            this.thumbnailImage.show(true);
            this.thumbnailImage.src = value;
        });
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
        const delta = (this.element.timeline.scaled ? e.scaledDeltaPosition.x : e.deltaPosition.x)
            / this.element.timeline?.pixelsPerSecondUnit;
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