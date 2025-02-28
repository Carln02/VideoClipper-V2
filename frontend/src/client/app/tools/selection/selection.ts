import {Tool} from "../tool/tool";
import {ClosestOrigin, define, div, TurboDragEvent, TurboEvent} from "turbodombuilder";
import {Card} from "../../components/card/card";
import {ToolType} from "../../managers/toolManager/toolManager.types";
import {TextElement} from "../../components/textElement/textElement";
import {ContextManager} from "../../managers/contextManager/contextManager";
import {ContextView} from "../../managers/contextManager/contextManager.types";
import {Clip} from "../../components/clip/clip";
import {Canvas} from "../../views/canvas/canvas";
import {Timeline} from "../../components/timeline/timeline";
import {MovableComponent} from "../../components/basicComponents/movableComponent/movableComponent";
import {BranchingNode} from "../../components/branchingNode/branchingNode";
import {FlowManagementHandler} from "../../components/flow/handlers/types/flowManagement.handler";
import {DocumentManager} from "../../managers/documentManager/documentManager";

/**
 * @description Tool that allows user to select elements and move them around
 */
@define("selection-tool")
export class SelectionTool extends Tool {
    private context: ContextManager;
    
    private clipClone: MovableComponent<Clip> = null;
    private readonly timelineIndicator: HTMLDivElement;
    private timelineIndicatorIndex: number;

    private currentTarget: Element;

    public constructor(documentManager: DocumentManager) {
        super(documentManager, ToolType.selection);
        this.context = ContextManager.instance;
        this.timelineIndicator = div({style: "background-color: pink; width: 5px; border: 2px solid cyan"});
    }

    public clickAction(e: TurboEvent) {
        const closestText = e.closest(TextElement);
        const closestClip = e.closest(Clip);
        const closestCard = e.closest(Card);

        if (closestText && this.context.view == ContextView.camera) {
            this.context.setContext(closestText, 3);
            closestText.select(true);
            this.currentTarget = closestText;
        } else if (closestClip) {
            this.context.setContext(e.closest(Card, false), 1);
            this.context.setContext(closestClip, 2);
            closestClip.selected = true;
            this.currentTarget = closestClip;
        } else if (closestCard) {
            this.context.setContext(closestCard, 1);
            this.currentTarget = closestCard;
        } else {
            this.context.clearContext();
            this.currentTarget = null;
        }
    }

    public dragStart(e: TurboDragEvent) {
        const closestText = e.closest(TextElement);
        const closestClip = e.closest(Clip);
        const closestNode = e.closest(BranchingNode);

        if (closestClip) {
            this.context.setContext(e.closest(Card, false), 1);
            this.context.setContext(closestClip, 2);
            this.currentTarget = closestClip;
            this.cloneClip(e, closestClip);
        }
        //Click start --> save the card that was clicked on (if any)
        else if (this.context.view == ContextView.canvas && closestNode) {
            this.context.setContext(closestNode, 1);
            this.currentTarget = closestNode;
        } else if (this.context.view == ContextView.camera && closestText) {
            this.context.setContext(closestText, 3);
            closestText.select(true);
            this.currentTarget = closestText;
        }
    }

    public dragAction(e: TurboDragEvent) {
        //On drag and if dragging a card --> compute delta position of drag, move card accordingly, and update
        //affected flows
        if (this.clipClone) {
            this.clipClone.translateBy(e.scaledDeltaPosition);
            this.insertIndicatorAfterClosestClip(e);
        } else if (this.context.view == ContextView.canvas && this.currentTarget instanceof BranchingNode) {
            this.currentTarget.move(e.scaledDeltaPosition);
            FlowManagementHandler.updateFlowsAfterMovingNode(this.currentTarget.dataId.toString(), e.scaledDeltaPosition);
        } else if (this.context.view == ContextView.camera && this.currentTarget instanceof TextElement) {
            this.currentTarget.translateBy(e.scaledDeltaPosition);
            // this.context.getAllOfType(TextElement).forEach(entry => {
            //     if (!(entry instanceof TextElement)) return;
            //     entry.translateBy(e.scaledDeltaPosition);
            // });
        }
    }

    public dragEnd(e: TurboDragEvent) {
        if (this.clipClone) {
            this.moveClip(e);
        }
        this.currentTarget = null;
        // else if (this.context.view == ContextView.canvas) {
        //     if (e.closest(Card)) this.context.removeContext(e.closest(Card));
        // } else if (this.context.view == ContextView.camera && this.context.getOfType(TextElement)) {
        //     this.context.removeContext(e.closest(TextElement), 3);
        // }
    }

    private cloneClip(e: TurboDragEvent, clip: Clip) {
        const clone = clip.clone();
        clip.setStyle("opacity", "0.4");
        this.clipClone = new MovableComponent(clone, clip, {parent: Canvas.instance.content});
        this.clipClone.translation = e.scaledPosition;
    }

    private insertIndicatorAfterClosestClip(e: TurboDragEvent) {
        const closestTimeline = e.closest(Timeline, true, ClosestOrigin.position);
        if (!closestTimeline) {
            this.removeTimelineIndicator();
            return;
        }

        this.timelineIndicatorIndex = closestTimeline.getClipAt(closestTimeline.getTimeFromPosition(e)).closestIntersection;
        const siblingAfter = closestTimeline.clips[this.timelineIndicatorIndex];
        const siblingBefore = closestTimeline.clips[this.timelineIndicatorIndex - 1];

        if (siblingAfter == this.clipClone.originElement || siblingBefore == this.clipClone.originElement) {
            this.removeTimelineIndicator();
            return;
        }
        closestTimeline.clipsContainer.addChildBefore(this.timelineIndicator, siblingAfter);
    }

    private moveClip(e: TurboDragEvent) {
        const closestTimeline = e.closest(Timeline, true, ClosestOrigin.position);
        const newCard = e.closest(Card, false, ClosestOrigin.position);

        if (closestTimeline && this.timelineIndicatorIndex != -1) {
            const clipData = this.clipClone.originElement.data;
            // const clipIndex = clipData.index;
            // const cardId = clipData.parent.parent.id;
            //
            // this.context.clearContext();
            //
            // if (newCard.id == cardId && this.timelineIndicatorIndex >= clipIndex) this.timelineIndicatorIndex--;
            //
            // newCard.addClip(structuredClone(clipData), this.timelineIndicatorIndex).then(() => {
            //     const newClip = newCard.clips[this.timelineIndicatorIndex];
            //     this.context.setContext(newCard, 1);
            //     this.context.setContext(newClip, 2);
            //     newClip.selected = true;
            // });
            //
            // this.clipClone.originElement.card.removeClip(this.clipClone.originElement);
        }

        this.clipClone.originElement.setStyle("opacity", "1");
        this.removeTimelineIndicator();
        this.clipClone.remove();
        this.clipClone = null;
    }

    private removeTimelineIndicator() {
        this.timelineIndicator.remove();
        this.timelineIndicatorIndex = -1;
    }
}
