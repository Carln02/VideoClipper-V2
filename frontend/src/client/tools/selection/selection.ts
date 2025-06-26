import {VcTool} from "../tool/tool";
import {ToolType} from "../../directors/project/project.types";
import {MovableComponent} from "../../components/basicComponents/movableComponent/movableComponent";
import {Clip} from "../../components/clip/clip";
import {Timeline} from "../../components/timeline/timeline";
import {YMap} from "../../../yManagement/yManagement.types";
import {VcToolProperties} from "../tool/tool.types";
import {define, div, TurboDragEvent} from "turbodombuilder";

@define()
export class SelectionTool extends VcTool<ToolType> {
    public clipClone: MovableComponent<Clip> = null;
    public timelineIndicator: HTMLDivElement;
    public timelineIndicatorIndex: number;

    public constructor(properties: VcToolProperties<ToolType>) {
        super(properties)
        this.timelineIndicator = div({style: "background-color: pink; width: 5px; border: 2px solid cyan"});
    }

    public insertIndicatorAfterClosestClip(e: TurboDragEvent, timeline: Timeline) {
        if (!timeline) return this.removeTimelineIndicator();

        this.timelineIndicatorIndex = timeline.getClipFromPosition(e).closestIntersection;

        if (timeline.clips[this.timelineIndicatorIndex] == this.clipClone.originElement
            || timeline.clips[this.timelineIndicatorIndex - 1] == this.clipClone.originElement) {
            this.removeTimelineIndicator();
            return;
        }

        timeline.addIndicatorAt(this.timelineIndicator, this.timelineIndicatorIndex + 1);
    }

    public moveClip(timeline: Timeline) {
        if (timeline && this.timelineIndicatorIndex != -1) {
            this.contextManager.clearContext();

            if (timeline.card == this.clipClone.originElement.card
                && this.timelineIndicatorIndex >= this.clipClone.originElement.dataIndex)
                this.timelineIndicatorIndex--;

            const clipDataCopy = (this.clipClone.originElement.data as YMap).toJSON();
            this.clipClone.originElement.card.removeClip(this.clipClone.originElement);
            timeline.card.addClip(Clip.createData(clipDataCopy), this.timelineIndicatorIndex).then(index => {
                this.contextManager.setContext(timeline.card, 1);
                this.contextManager.setContext(timeline.card.timeline.clips[index], 2, true);
            });
        }

        this.cancelClipMoving();
    }

    protected removeTimelineIndicator() {
        this.timelineIndicator.remove();
        this.timelineIndicatorIndex = -1;
    }

    protected cancelClipMoving() {
        this.clipClone.originElement?.setStyle("opacity", "1");
        this.removeTimelineIndicator();
        this.clipClone.remove();
        this.clipClone = null;
    }
}