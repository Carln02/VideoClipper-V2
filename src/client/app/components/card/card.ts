import {ClickMode, DefaultEventName, define, div, Point, TurboEvent, TurboEventName, TurboInput} from "turbodombuilder";
import "./card.css";
import {SyncedCard, SyncedCardData} from "./card.types";
import {Timeline} from "../timeline/timeline";
import {ClipRenderer} from "../clipRenderer/clipRenderer";
import {BranchingNode} from "../branchingNode/branchingNode";
import {formatMmSs} from "../../../utils/time";
import {Direction} from "../basicComponents/panelThumb/panelThumb.types";
import {SyncedClip} from "../clip/clip.types";
import {Clip} from "../clip/clip";
import {MetadataDrawer} from "../metadataDrawer/metadataDrawer";
import {proxied, YProxyEventName, YString} from "../../../../yProxy";

/**
 * @description Class representing a card
 */
@define("vc-card")
export class Card extends BranchingNode<SyncedCard> {
    public readonly renderer: ClipRenderer;

    private readonly metadataDrawerParent: HTMLDivElement;
    private readonly metadataDrawer: MetadataDrawer;

    private readonly timelineParent: HTMLDivElement;
    public readonly timeline: Timeline;

    private readonly titleElement: TurboInput;

    private readonly durationElement: HTMLDivElement;

    constructor(data: SyncedCard, parent: HTMLElement) {
        super(undefined, parent);

        this.renderer = new ClipRenderer({parent: this});

        this.metadataDrawerParent = div({parent: this, classes: "metadata-drawer-parent"});
        this.timelineParent = div({parent: this, classes: "timeline-parent"});

        this.titleElement = new TurboInput({selectTextOnFocus: true, parent: this});
        this.durationElement = div();

        this.addChild(div({
            parent: this,
            classes: "card-title",
            children: [this.titleElement, this.durationElement]
        }));

        this.metadataDrawer = new MetadataDrawer(data.metadata, {
            parent: this.metadataDrawerParent,
            direction: Direction.bottom,
            fitSizeOf: this.metadataDrawerParent,
            initiallyClosed: true,
            openOffset: 6,
        });

        this.data = data;

        this.timeline = new Timeline(data.syncedClips, this.renderer, {
            parent: this.timelineParent,
            direction: Direction.right,
            fitSizeOf: this.timelineParent,
            initiallyClosed: true,
            openOffset: 16
        });

        this.renderer.cardData = this.data;

        this.addEventListener(DefaultEventName.clickStart, () => this.bringToFront());
        this.titleElement.addEventListener(DefaultEventName.blur, () => this.data.title = this.titleElement.value as YString);
    }

    /**
     * @function create
     * @static
     * @async
     * @description Creates a new card from the provided data by adding the latter to the Yjs document. It assigns a
     * default title to the card as "Card - [counter]," where counter is an incremented shared integer. It also sets
     * the metadata and clips array as observable, so components that would attach to one of the latter will be able
     * to observe them.
     * @param {SyncedCard} data - The data to create the card from.
     * @returns {Promise<string>} - The ID of the created card in root.cards.
     */
    public static async create(data: SyncedCardData): Promise<string> {
        this.root.counters.cards++;
        data.title = proxied("Card - " + this.root.counters.cards);
        return await super.createInObject(data, this.root.cards);
    }

    /**
     * @function getAll
     * @static
     * @description Retrieves all cards in the document.
     * @returns {Card[]} - Array containing all the cards in the document.
     */
    public static getAll(): Card[] {
        return Object.values(this.root.cards.value)
            .flatMap(cardData => cardData.getBoundObjectsOfType(Card));
    }

    protected setupCallbacks(): void {
        super.setupCallbacks();
        this.data.title.bind(YProxyEventName.changed, (value: string) => this.titleElement.value = value, this);
    }

    /**
     * @description The total duration of the card. When set, will update the value of the duration element.
     */
    public set duration(value: number) {
        this.durationElement.textContent = formatMmSs(value);
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
        this.titleElement.inputElement.dispatchEvent(
            new TurboEvent(new Point(), ClickMode.left, [], TurboEventName.click));
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

    /**
     * @description Whether the element is selected or not. Setting it will accordingly toggle the "selected" CSS
     * class on the element and update the UI, as well as bring it the card to the front.
     */
    public set selected(value: boolean) {
        super.selected = value;
        if (value) this.bringToFront();
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
