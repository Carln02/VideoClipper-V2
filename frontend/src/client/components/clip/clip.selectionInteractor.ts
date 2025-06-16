import {ClosestOrigin, DefaultEventName, div, TurboDragEvent, TurboInteractor} from "turbodombuilder";
import {ToolType} from "../../directors/project/project.types";
import {Clip} from "./clip";
import {ClipView} from "./clip.view";
import {ClipModel} from "./clip.model";
import {MovableComponent} from "../basicComponents/movableComponent/movableComponent";
import {Card} from "../card/card";
import {Timeline} from "../timeline/timeline";
import {YMap} from "../../../yManagement/yManagement.types";
import {ContextManager} from "../../managers/contextManager/contextManager";

export class ClipSelectionInteractor extends TurboInteractor<ToolType, Clip, ClipView, ClipModel> {
    public tool = ToolType.selection;

    protected clipClone: MovableComponent<Clip> = null;
    protected timelineIndicator: HTMLDivElement;
    protected timelineIndicatorIndex: number;

    public propagateUp = {
        [DefaultEventName.clickStart]: true
    };

    protected get contextManager(): ContextManager {
        return this.element.director.contextManager;
    }

    public initialize(): void {
        this.timelineIndicator = div({style: "background-color: pink; width: 5px; border: 2px solid cyan"});
    }

    public clickStart() {
        this.contextManager.setContext(this.element, 2);
    }

    public dragStart(e: TurboDragEvent): boolean {
        this.clipClone = this.element.cloneAndMove(e);
        return false;
    }

    public drag(e: TurboDragEvent): boolean {
        //On drag and if dragging a card --> compute delta position of drag, move card accordingly, and update
        //affected flows
        if (!this.clipClone) return false;
        this.clipClone.translateBy(e.scaledDeltaPosition);
        this.insertIndicatorAfterClosestClip(e);
        return false;
    }

    public dragEnd(e: TurboDragEvent): boolean {
        if (this.clipClone) this.moveClip(e);
        return false;
    }

    private insertIndicatorAfterClosestClip(e: TurboDragEvent) {
        const closestTimeline = e.closest(Timeline, true, ClosestOrigin.position);
        if (!closestTimeline) {
            this.removeTimelineIndicator();
            return;
        }

        this.timelineIndicatorIndex = closestTimeline.getClipFromPosition(e).closestIntersection;

        if (closestTimeline.clips[this.timelineIndicatorIndex] == this.clipClone.originElement
            || closestTimeline.clips[this.timelineIndicatorIndex - 1] == this.clipClone.originElement) {
            this.removeTimelineIndicator();
            return;
        }

        closestTimeline.addIndicatorAt(this.timelineIndicator, this.timelineIndicatorIndex + 1);
    }

    private moveClip(e: TurboDragEvent) {
        const closestTimeline = e.closest(Timeline, true, ClosestOrigin.position);
        const newCard = e.closest(Card, false, ClosestOrigin.position);

        if (closestTimeline && this.timelineIndicatorIndex != -1) {
            this.contextManager.clearContext();

            if (newCard == this.clipClone.originElement.card
                && this.timelineIndicatorIndex >= this.clipClone.originElement.dataIndex)
                this.timelineIndicatorIndex--;

            const clipDataCopy = (this.clipClone.originElement.data as YMap).toJSON();
            this.clipClone.originElement.card.removeClip(this.clipClone.originElement);
            newCard.addClip(Clip.createData(clipDataCopy), this.timelineIndicatorIndex).then(index => {
                this.contextManager.setContext(newCard, 1);
                this.contextManager.setContext(newCard.timeline.clips[index], 2, true);
            });
        }

        this.clipClone.originElement?.setStyle("opacity", "1");
        this.removeTimelineIndicator();
        this.clipClone.remove();
        this.clipClone = null;
    }

    private removeTimelineIndicator() {
        this.timelineIndicator.remove();
        this.timelineIndicatorIndex = -1;
    }
}