import {Tool} from "../tool/tool";
import {define, TurboEvent} from "turbodombuilder";
import {ToolType} from "../../managers/toolManager/toolManager.types";
import {Clip} from "../../components/clip/clip";
import {TextElement} from "../../components/textElement/textElement";
import {BranchingNode} from "../../components/branchingNode/branchingNode";
import {DocumentManager} from "../../views/canvas/managers/documentManager/documentManager";

@define("delete-tool")
export class DeleteTool extends Tool {
    public constructor(documentManager: DocumentManager) {
        super(documentManager, ToolType.delete);
    }

    public clickAction(e: TurboEvent) {
        if (e.closest(TextElement)) e.closest(TextElement).clip.removeText(e.closest(TextElement));
        else if (e.closest(Clip)) e.closest(Clip).card.removeClip(e.closest(Clip));
        else if (e.closest(BranchingNode)) e.closest(BranchingNode).delete();
    }
}