import {define, TurboCustomProperties, TurboProperties} from "turbodombuilder";
import "./card.css";
import {SyncedCard} from "./card.types";
import {Timeline} from "../timeline/timeline";
import {ClipRenderer} from "../clipRenderer/clipRenderer";
import {SyncedClip} from "../clip/clip.types";
import {Clip} from "../clip/clip";
import {MetadataDrawer} from "../metadataDrawer/metadataDrawer";
import {CardModel} from "./card.model";
import {CardView} from "./card.view";
import {BranchingNode} from "../branchingNode/branchingNode";
import {SyncedCardMetadata} from "../metadataDrawer/metadataDrawer.types";

/**
 * @description Class representing a card
 */
@define("vc-card")
export class Card extends BranchingNode<CardView, SyncedCard, CardModel> {
    public constructor(properties: TurboCustomProperties<CardView, SyncedCard, CardModel> = {}) {
        super({...properties, data: undefined});
        this.generateMvc(CardView, CardModel, properties.data);
        this.renderer.card = this;
    }

    public get renderer(): ClipRenderer {
        return this.view.renderer;
    }

    public get metadataDrawer(): MetadataDrawer {
        return this.view.metadataDrawer;
    }

    public get timeline(): Timeline {
        return this.view.timeline;
    }

    public get title(): string {
        return this.model.title;
    }

    public get metadata(): SyncedCardMetadata {
        return this.model.metadata;
    }

    /**
     * @description Whether the element is selected or not. Setting it will accordingly toggle the "selected" CSS
     * class on the element and update the UI, as well as bring it the card to the front.
     */
    public get selected(): boolean {
        return super.selected;
    }

    public set selected(value: boolean) {
        super.selected = value;
    }

    /**
     * @description The total duration of the card. When set, will update the value of the duration UI element.
     */
    public set duration(value: number) {
        this.view.duration = value;
    }

    /**
     * @description Array of clips components in this card's timeline.
     */
    public get clips(): Clip[] {
        return this.timeline.clips;
    }

    /**
     * @function editTitle
     * @description Focuses the title field of the card.
     */
    public editTitle() {
        this.view.editTitle();
    }

    /**
     * @function addClip
     * @async
     * @description Adds the provided clip data in the Yjs document at the provided index.
     * @param {SyncedClip} clip - The data to append.
     * @param {number} [index] - The index at which to append the data. If not provided, the clip will be pushed at
     * the end of the card's syncedClips array.
     */
    public async addClip(clip: SyncedClip, index?: number) {
        return await this.timeline.addClip(clip, index);
    }

    /**
     * @function removeClip
     * @description Removes the provided Clip from both the Yjs document and the HTML document.
     * @param {Clip} clip - The clip to remove.
     */
    public removeClip(clip: Clip) {
        const index = this.clips.indexOf(clip);
        if (index < 0) return;
        this.timeline.removeClip(index);
    }

    /**
     * @function removeClipAt
     * @description Removes the clip at the provided index from both the Yjs document and the HTML document.
     * @param {number} index - The index of the clip to remove.
     */
    public removeClipAt(index: number) {
        this.timeline.removeClip(index);
    }

    public delete() {
        //TODO convert to branching node if on branches
        super.delete();
    }

    //TODO Move to clipRenderer
    // private refreshTitle() {
    //     this.data.title = this.titleElement.value.toString();
    //     const titleEntry = this.syncedClips[0]?.content.find(text => text.type == TextType.title);
    //     if (titleEntry) {
    //         titleEntry.text = this.title;
    //         this.renderer.reloadVisibility(true);
    //         this.setSaveTimer();
    //     }
    // }
}
