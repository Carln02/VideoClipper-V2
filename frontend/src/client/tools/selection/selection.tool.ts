import {turbo, TurboDragEvent, TurboTool} from "turbodombuilder";
import {ToolType} from "../../directors/project/project.types";
import {BranchingNode} from "../../components/branchingNode/branchingNode";
import {Clip} from "../../components/clip/clip";
import {Selection} from "./selection";
import {SelectionModel} from "./selection.model";
import {TextElement} from "../../components/textElement/textElement";
import {Project} from "../../directors/project/project";

export class SelectionTool extends TurboTool<Selection, any, SelectionModel> {
    public toolName = ToolType.selection;

    public clickStart(_, target: Node): boolean {
        if (target instanceof Project) this.element.contextManager.clearContext();
        else if (target instanceof TextElement) this.element.contextManager.setContext(target, 3, true);
        else if (target instanceof Clip) this.element.contextManager.setContext(target, 2, true);
        else if (target instanceof BranchingNode) {
            this.element.contextManager.setContext(target, 1);
            return true;
        }
    }

    public dragStart(e: TurboDragEvent, target: Node): boolean {
        if (target instanceof Clip) {
            this.view.clipClone = target.cloneAndMove(e);
            turbo(this.element.director.canvas.content).addChild(this.view.clipClone);
            return true;
        }
    }

    public drag(e: TurboDragEvent, target: Node) {
        if ("move" in target && typeof target.move === "function") {
            target.move(e.scaledDeltaPosition);
            return true;
        }
        if (this.view.clipClone) {
            this.view.clipClone.translateBy(e.scaledDeltaPosition);
            this.emitter.fire("updateIndicator", e);
            return true;
        }

    // public drag(e: TurboDragEvent) {
    //         e.stopImmediatePropagation();
    //         // this.element.translateBy(e.scaledDeltaPosition);
    //         this.element.director.contextManager.getAllOfType(TextElement).forEach(entry => {
    //             if (!(entry instanceof TextElement)) return;
    //             entry.translateBy(e.scaledDeltaPosition);
    //         });
    //     }
    }

    public dragEnd(e: TurboDragEvent): boolean {
        if (this.view.clipClone) {
            this.emitter.fire("moveCLip", e);
            return true;
        }
    }
}