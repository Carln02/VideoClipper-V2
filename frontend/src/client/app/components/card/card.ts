import {define, TurboCustomProperties} from "turbodombuilder";
import "./card.css";
import {SyncedCard} from "./card.types";
import {Timeline} from "../timeline/timeline";
import {ClipRenderer} from "../clipRenderer/clipRenderer";
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
        this.mvc.generate({
            viewConstructor: CardView,
            modelConstructor: CardModel,
            data: properties.data
        });
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
     * @function editTitle
     * @description Focuses the title field of the card.
     */
    public editTitle() {
        this.view.editTitle();
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
