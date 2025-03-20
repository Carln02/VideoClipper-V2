import {Coordinate, Point, TurboHandler} from "turbodombuilder";
import {YUtilities} from "../../../../yManagement/yUtilities";
import {TextType} from "../textElement/textElement.types";
import {TextElement} from "../textElement/textElement";
import {ClipModel} from "./clip.model";

export class ClipTextHandler extends TurboHandler<ClipModel> {
    /**
     * @function addText
     * @description Adds a new text entry in the current clip data at the provided position.
     * @param {Point | Coordinate} position - The position of the text's anchor point on the clip in percentage
     * (between 0 and 1).
     */
    public addText(position: Point | Coordinate) {
        YUtilities.addInYArray({
            text: "Text",
            type: TextType.custom,
            origin: position instanceof Point ? position.object : position,
            fontSize: 0.1
        }, this.model.content);
    }

    /**
     * @function removeText
     * @description Removes the provided text element from the HTML document and the Yjs document.
     * @param {TextElement} entry - The text element to remove.
     */
    public removeText(entry: TextElement) {
        if (!YUtilities.removeFromYArray(entry, this.model.content)) return;
        // const index = this.content?.indexOf(entry.data);
        // if (index < 0) return;
        // entry.data.destroyBoundObjects();
        // this.data.content?.splice(index, 1);
    }

    /**
     * @function removeTextAt
     * @description Removes the text entry at the provided index in the clip's content.
     * @param {number} index - The index of the text to remove.
     */
    public removeTextAt(index: number) {
        if (index < 0 || index >= this.model.content.length) return;
        this.model.content.delete(index);
        // this.data.content[index].destroyBoundObjects();
        // this.data.content?.splice(index, 1);
    }
}