import {ClipModel} from "./clip.model";
import {Clip} from "./clip";
import {
    DefaultEventName,
    Direction,
    div,
    effect,
    icon,
    img,
    Side,
    turbo,
    TurboDragEvent,
    TurboView
} from "turbodombuilder";

export class ClipView extends TurboView<Clip, ClipModel> {
    public clipContent: HTMLDivElement;
    private thumbnailImage: HTMLImageElement;

    private leftHandle: HTMLDivElement;
    private rightHandle: HTMLDivElement;

    public initialize() {
        super.initialize();
        turbo(this.thumbnailImage).show(false);
    }

    protected setupUIElements() {
        this.clipContent = div({classes: "vc-clip-content"});
        this.thumbnailImage = img({src: "", parent: this.clipContent, classes: "thumbnail"});
    }

    protected setupUILayout() {
        turbo(this).addChild(this.clipContent);
        turbo(this.clipContent).addChild(this.thumbnailImage);
    }

    private generateHandles() {
        const showHandles = this.leftHandle?.parentElement;
        turbo(this.leftHandle).destroy();
        turbo(this.rightHandle).destroy();
        this.leftHandle = this.generateHandle(this.element.orientation === Direction.horizontal ? Side.left : Side.top);
        this.rightHandle = this.generateHandle(this.element.orientation === Direction.horizontal ? Side.right : Side.bottom);
        if (showHandles) this.showHandles(true);
    }

    private generateHandle(side: Side) {
        const handle = div({
            classes: `clip-handle clip-handle-${side}`,
            children: icon({icon: `chevron-${side}`})
        });
        turbo(handle).on(DefaultEventName.clickStart, () => true)
            .on(DefaultEventName.dragStart, () => true)
            .on(DefaultEventName.drag, (e: TurboDragEvent) => {
                const deltaPosition = this.element.timeline.scaled ? e.scaledDeltaPosition : e.deltaPosition;
                const delta = deltaPosition[this.model.orientation === Direction.horizontal ? "x" : "y"]
                    / this.element.timeline?.pixelsPerSecondUnit;
                if (side === Side.left || side === Side.top) this.model.startTime += delta;
                else this.model.endTime += delta;
                return true;
            })
            .on(DefaultEventName.dragEnd, () => this.model.normalizeTime());
        return handle;
    }

    public showHandles(b: boolean) {
        if (!this.leftHandle) {
            if (!b) return;
            this.generateHandles();
        }

        if (b) turbo(this).addChild([this.leftHandle, this.rightHandle], 0);
        else turbo(this).remChild([this.leftHandle, this.rightHandle]);
    }

    /**
     * @function reloadSize
     * @description Reloads the size of the clip element and thus, reloads as well the timeline.
     */
    @effect protected reloadSize() {
        if (isNaN(this.element.duration)) return;
        const size = this.element.timeline?.pixelsPerSecondUnit * this.element.duration;
        turbo(this).setStyles({
            width: this.model.orientation == Direction.horizontal ? size + "px" : "auto",
            height: this.model.orientation == Direction.vertical ? size + "px" : "auto"
        });
        this.element.timeline.reloadTime();
    }

    @effect private updateOrientation() {
        turbo(this).toggleClass("vertical-clip", this.model.orientation === Direction.vertical);
        if (this.leftHandle) {
            turbo(this.leftHandle).destroy();
            turbo(this.rightHandle).destroy();
        }
        this.reloadSize();
    }

    @effect private updateColor() {
        turbo(this.clipContent).setStyle("backgroundColor", this.model.color);
    }

    @effect private updateHidden() {
        turbo(this).toggleClass("hidden-clip", !!this.model.hidden);
    }

    @effect private updateThumbnail() {
        turbo(this.thumbnailImage).show(true).src = this.model.thumbnail;
    }
}