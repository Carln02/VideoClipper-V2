import {ClosestOrigin, DefaultEventName, TurboDragEvent, TurboInteractor} from "turbodombuilder";
import {ToolType} from "../../directors/project/project.types";
import {Clip} from "./clip";
import {ClipView} from "./clip.view";
import {ClipModel} from "./clip.model";
import {ContextManager} from "../../managers/contextManager/contextManager";
import {SelectionTool} from "../../tools/selection/selection";
import {ClipTimeline} from "../timeline/clipTimeline/clipTimeline";

export class ClipSelectionInteractor extends TurboInteractor<ToolType, Clip, ClipView, ClipModel> {
    public tool = ToolType.selection;

    public propagateUp = {
        [DefaultEventName.clickStart]: true,
    };

    protected get contextManager(): ContextManager {
        return this.element.director.contextManager;
    }

    public clickStart() {
        this.contextManager.setContext(this.element, 2);
    }

    public click() {
        console.log("EWFFEWEFWEFW")
        this.contextManager.setContext(this.element, 2, true);
    }

    public dragStart(e: TurboDragEvent, tool: SelectionTool) {
        tool.clipClone = this.element.cloneAndMove(e);
        tool.director.canvas.content.addChild(tool.clipClone);
    }

    public drag(e: TurboDragEvent, tool: SelectionTool) {
        if (!tool.clipClone) return;
        tool.clipClone.translateBy(e.scaledDeltaPosition);
        tool.insertIndicatorAfterClosestClip(e, this.getClosestTimeline(e));
    }

    public dragEnd(e: TurboDragEvent, tool: SelectionTool) {
        if (tool.clipClone) tool.moveClip(this.getClosestTimeline(e));
    }

    protected getClosestTimeline(e: TurboDragEvent) {
        const timeline = e.closest(ClipTimeline, false, ClosestOrigin.position);
        if (!timeline) return undefined;
        return e.closest(ClipTimeline, timeline.clipsContainer, ClosestOrigin.position);
    }
}