import {ClosestOrigin, define, div, Tool, ToolModel, ToolView, TurboDragEvent, TurboEvent} from "turbodombuilder";
import {Card} from "../../components/card/card";
import {ToolType} from "../../managers/toolManager/toolManager.types";
import {TextElement} from "../../components/textElement/textElement";
import {ContextView} from "../../managers/contextManager/contextManager.types";
import {Clip} from "../../components/clip/clip";
import {Timeline} from "../../components/timeline/timeline";
import {MovableComponent} from "../../components/basicComponents/movableComponent/movableComponent";
import {BranchingNode} from "../../components/branchingNode/branchingNode";
import { YMap } from "../../../yManagement/yManagement.types";
import {Project} from "../../directors/project/project";
import {ProjectScreens} from "../../directors/project/project.types";

/**
 * @description Tool that allows user to select elements and move them around
 */
@define("selection-tool")
export class SelectionTool extends Tool {
    private clipClone: MovableComponent<Clip> = null;
    private readonly timelineIndicator: HTMLDivElement;
    private timelineIndicatorIndex: number;

    private currentTarget: Element;

    public constructor(project: Project) {
        super({toolManager: project.toolManager, director: project, name: ToolType.selection});
        this.mvc.generate({
            viewConstructor: ToolView,
            modelConstructor: ToolModel
        });
        this.timelineIndicator = div({style: "background-color: pink; width: 5px; border: 2px solid cyan"});
    }

    public clickAction(e: TurboEvent) {
        const closestText = e.closest(TextElement);
        const closestClip = e.closest(Clip);
        const closestCard = e.closest(Card);

        if (closestText && this.contextManager.view == ContextView.camera) {
            this.contextManager.setContext(closestText, 3, true);
            this.currentTarget = closestText;
        } else if (closestClip) {
            this.contextManager.setContext(e.closest(Card, false), 1);
            this.contextManager.setContext(closestClip, 2, true);
            this.currentTarget = closestClip;
        } else if (closestCard) {
            this.contextManager.setContext(closestCard, 1, true);
            this.currentTarget = closestCard;
        } else {
            this.contextManager.clearContext();
            this.currentTarget = null;
        }
    }

    public dragStart(e: TurboDragEvent) {
        const closestText = e.closest(TextElement);
        const closestClip = e.closest(Clip);
        const closestNode = e.closest(BranchingNode);

        if (closestClip) {
            this.contextManager.setContext(e.closest(Card, false), 1);
            this.contextManager.setContext(closestClip, 2, true);
            this.currentTarget = closestClip;
            this.clipClone = closestClip.cloneAndMove(e);
        }
        //Click start --> save the card that was clicked on (if any)
        else if (this.project.currentType == ProjectScreens.canvas && closestNode) {
            this.contextManager.setContext(closestNode, 1);
            this.currentTarget = closestNode;
        } else if (this.project.currentType == ProjectScreens.camera && closestText) {
            this.contextManager.setContext(closestText, 3);
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
        } else if (this.project.currentType == ProjectScreens.canvas && this.currentTarget instanceof BranchingNode) {
            const id = this.currentTarget.dataId;
            this.currentTarget.move(e.scaledDeltaPosition);
            this.project.forEachBranch((branch) => branch.updateAfterMovingNode(id, e.scaledDeltaPosition));
        } else if (this.project.currentType == ProjectScreens.camera && this.currentTarget instanceof TextElement) {
            this.currentTarget.translateBy(e.scaledDeltaPosition);
            this.contextManager.getAllOfType(TextElement).forEach(entry => {
                if (!(entry instanceof TextElement)) return;
                entry.translateBy(e.scaledDeltaPosition);
            });
        }
    }

    public dragEnd(e: TurboDragEvent) {
        this.currentTarget = null;
        if (this.clipClone) {
            this.moveClip(e);
        }
        else if (this.project.currentType == ProjectScreens.canvas) {
            if (e.closest(Card)) this.contextManager.removeContext(e.closest(Card));
        } else if (this.project.currentType == ProjectScreens.camera && this.contextManager.getOfType(TextElement)) {
            this.contextManager.removeContext(e.closest(TextElement), 3);
        }
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
