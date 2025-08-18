import {ClipModel} from "./clip.model";
import {Clip} from "./clip";
import {DefaultEventName, Direction, div, icon, img, TurboDragEvent, TurboView} from "turbodombuilder";

export class ClipView extends TurboView<Clip, ClipModel> {
    public clipContent: HTMLDivElement;
    private thumbnailImage: HTMLImageElement;

    private leftHandle: HTMLDivElement;
    private rightHandle: HTMLDivElement;

    /**
     * @function reloadSize
     * @description Reloads the size of the clip element and thus, reloads as well the timeline.
     */
    protected reloadSize() {
        this.element.setStyle(this.model.orientation == Direction.horizontal ? "width" : "height",
            this.element.timeline?.pixelsPerSecondUnit * this.element.duration + "px");
        this.element.timeline.reloadTime();
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

        this.emitter.add("orientation", (value: Direction) => {
            this.element.toggleClass("vc-clip-h", value === Direction.horizontal);
            this.element.toggleClass("vc-clip-v", value === Direction.vertical);
            this.reloadSize();
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
        if( this.element.orientation == Direction.horizontal ) {
            this.leftHandle = div({classes: "clip-handle-left", children: icon({icon: "chevron-left"})});
            this.rightHandle = div({classes: "clip-handle-right", children: icon({icon: "chevron-right"})});

            this.generateHandleEvents(this.leftHandle, "left");
            this.generateHandleEvents(this.rightHandle, "right");
        } else {
            this.leftHandle = div({classes: "clip-handle-top", children: icon({icon: "chevron-up"})});
            this.rightHandle = div({classes: "clip-handle-bottom", children: icon({icon: "chevron-down"})});

            this.generateHandleEvents(this.leftHandle, "top");
            this.generateHandleEvents(this.rightHandle, "bottom");
        }
    }

    private generateHandleEvents(handle: HTMLDivElement, side: "left" | "right" | "top" | "bottom") {
        handle.addEventListener(DefaultEventName.clickStart, (e: TurboDragEvent) => e.stopImmediatePropagation());
        handle.addEventListener(DefaultEventName.dragStart, (e: TurboDragEvent) => e.stopImmediatePropagation());
        handle.addEventListener(DefaultEventName.drag, (e: TurboDragEvent) => this.dragHandle(side, e));
        handle.addEventListener(DefaultEventName.dragEnd, () => this.model.normalizeTime());
    }

    private dragHandle(side: "left" | "right" | "top" | "bottom", e: TurboDragEvent) {
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