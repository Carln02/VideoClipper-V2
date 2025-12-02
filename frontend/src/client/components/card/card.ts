import {createYArray, createYMap, deepObserveAny, define, expose, turbo, YArray, YMap} from "turbodombuilder";
import "./card.css";
import {SyncedCard} from "./card.types";
import {Timeline} from "../timeline/timeline";
import {ClipRenderer} from "../clipRenderer/clipRenderer";
import {MetadataDrawer} from "../metadataDrawer/metadataDrawer";
import {CardModel} from "./card.model";
import {CardView} from "./card.view";
import {branchingNode, BranchingNode} from "../branchingNode/branchingNode";
import {SyncedCardMetadata} from "../metadataDrawer/metadataDrawer.types";
import {SyncedClip} from "../clip/clip.types";
import {VcProperties} from "../component/component.types";
import {Project} from "../../directors/project/project";
import {Clip} from "../clip/clip";

/**
 * @description Class representing a card
 */
@define("vc-card")
export class Card extends BranchingNode<CardView, SyncedCard, CardModel> {
    @expose("model") public accessor duration: number;
    @expose("model", false) public accessor title: string;
    @expose("model", false) public accessor metadata: SyncedCardMetadata;
    @expose("model", false) public accessor syncedClips: YArray<SyncedClip>;

    @expose("view", false) public accessor renderer: ClipRenderer;
    @expose("view", false) public accessor metadataDrawer: MetadataDrawer;
    @expose("view", false) public accessor timeline: Timeline;

    public initialize() {
        super.initialize();
        this.model.onSetBlock.add(() => {
            this.renderer.card = this;
            this.view.playback.card = this;
            this.view.timeline.card = this;
        });
    }

    public static createData(data?: SyncedCard): SyncedCard & YMap {
        if (!data) data = {};
        if (!data.origin) data.origin = {x: 0, y: 0};
        if (!data.title) data.title = "Card";
        if (!data.syncedClips) data.syncedClips = [undefined];
        data.metadata = MetadataDrawer.createData(data.metadata);

        const clipsArray = createYArray([]);
        data.syncedClips?.forEach((clip: SyncedClip) => clipsArray.push([Clip.createData(clip)]));
        data.syncedClips = clipsArray;

        return createYMap<SyncedCard>(data);
    }

    /**
     * @function editTitle
     * @description Focuses the title field of the card.
     */
    public editTitle() {
        this.view.editTitle();
    }

    public addClip(clip: SyncedClip & YMap, index?: number): number {
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

export function card(properties: VcProperties<CardView, SyncedCard, CardModel, Project> = {}): Card {
    turbo(properties).applyDefaults({tag: "vc-card", model: CardModel, view: CardView});
    return branchingNode({...properties}) as Card;
}