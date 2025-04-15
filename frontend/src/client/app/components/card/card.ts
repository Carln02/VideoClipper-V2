import {define} from "turbodombuilder";
import "./card.css";
import {SyncedCard} from "./card.types";
import {Timeline} from "../timeline/timeline";
import {ClipRenderer} from "../clipRenderer/clipRenderer";
import {MetadataDrawer} from "../metadataDrawer/metadataDrawer";
import {CardModel} from "./card.model";
import {CardView} from "./card.view";
import {BranchingNode} from "../branchingNode/branchingNode";
import {SyncedCardMetadata} from "../metadataDrawer/metadataDrawer.types";
import { YArray, YMap } from "../../../../yManagement/yManagement.types";
import {SyncedClip} from "../clip/clip.types";
import {VcComponentProperties} from "../component/component.types";
import {DocumentManager} from "../../managers/documentManager/documentManager";
import {Clip} from "../clip/clip";
import {YUtilities} from "../../../../yManagement/yUtilities";

/**
 * @description Class representing a card
 */
@define("vc-card")
export class Card extends BranchingNode<CardView, SyncedCard, CardModel> {
    public constructor(properties: VcComponentProperties<CardView, SyncedCard, CardModel, DocumentManager> = {}) {
        super({...properties, data: undefined});
        this.mvc.generate({
            viewConstructor: CardView,
            modelConstructor: CardModel,
            data: properties.data
        });
        this.renderer.card = this;
    }

    public static createData(data?: SyncedCard): SyncedCard & YMap {
        if (!data) data = {};
        if (!data.origin) data.origin = {x: 0, y: 0};
        if (!data.title) data.title = "Card";
        if (!data.syncedClips) data.syncedClips = [undefined];
        data.metadata = MetadataDrawer.createData(data.metadata);

        const clipsArray =YUtilities.createYArray([]);
        data.syncedClips?.forEach((clip: SyncedClip) => clipsArray.push([Clip.createData(clip)]));
        data.syncedClips = clipsArray;

        return YUtilities.createYMap<SyncedCard>(data);
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

    public get syncedClips(): YArray<SyncedClip> {
        return this.model.syncedClips;
    }

    /**
     * @function editTitle
     * @description Focuses the title field of the card.
     */
    public editTitle() {
        this.view.editTitle();
    }

    /**
     * @function delete
     * @description Deletes the node data from the Yjs document, destroys all its attached components (including this),
     * amd updates the attached flows accordingly.
     */
    public async delete() {
        await this.screenManager.createNewNode(this.model.origin, this.dataId);
        this.screenManager.delete(this);
    }

    public async addClip(clip: SyncedClip & YMap, index?: number): Promise<number> {
        return this.timeline.addClip(clip, index);
    }

    public removeClip(clip: Clip) {
        return this.timeline.removeClip(clip);
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
