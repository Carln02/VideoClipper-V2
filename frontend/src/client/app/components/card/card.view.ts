import {BranchingNodeView} from "../branchingNode/branchingNode.view";
import {ClickMode, DefaultEventName, div, Point, TurboEvent, TurboEventName, TurboInput} from "turbodombuilder";
import {MetadataDrawer} from "../metadataDrawer/metadataDrawer";
import {Timeline} from "../timeline/timeline";
import {formatMmSs} from "../../../utils/time";
import {ClipRenderer} from "../clipRenderer/clipRenderer";
import {Direction} from "../basicComponents/panelThumb/panelThumb.types";
import {Card} from "./card";
import {CardModel} from "./card.model";

export class CardView extends BranchingNodeView<Card, CardModel> {
    private _renderer: ClipRenderer;
    private _metadataDrawer: MetadataDrawer;
    private _timeline: Timeline;

    private titleElement: TurboInput;
    private durationElement: HTMLDivElement;

    public constructor(element: Card) {
        super(element);
    }

    public get renderer(): ClipRenderer {
        return this._renderer;
    }

    public get metadataDrawer(): MetadataDrawer {
        return this._metadataDrawer;
    }

    public get timeline(): Timeline {
        return this._timeline;
    }

    /**
     * @description The total duration of the card. When set, will update the value of the duration element.
     */
    public set duration(value: number) {
        this.durationElement.textContent = formatMmSs(value);
    }

    /**
     * @function editTitle
     * @description Focuses the title field of the card.
     */
    public editTitle() {
        this.titleElement.inputElement.dispatchEvent(
            new TurboEvent(new Point(), ClickMode.left, [], TurboEventName.click));
    }

    protected setupUIElements(): void {
        this._renderer = new ClipRenderer();

        this._metadataDrawer = new MetadataDrawer(this.element, this.model.metadata, {
            direction: Direction.bottom,
            // fitSizeOf: this.metadataDrawerParent,
            initiallyClosed: true,
            openOffset: 6,
        });

        // this._timeline = new Timeline(this.model.syncedClips, this.element, this.renderer, {
        //     direction: Direction.right,
        //     // TODO fitSizeOf: this.timelineParent,
        //     initiallyClosed: true,
        //     openOffset: 16
        // });

        this.titleElement = new TurboInput({selectTextOnFocus: true});
        this.durationElement = div();
    }

    protected setupUILayout(): void {
        this.element.addChild([
            this.renderer,
            div({classes: "metadata-drawer-parent", children: this.metadataDrawer}),
            div({classes: "timeline-parent", children: this.timeline}),
            div({
                classes: "card-title",
                children: [this.titleElement, this.durationElement]
            })
        ]);
    }

    protected setupUIListeners(): void {
        this.titleElement.addEventListener(DefaultEventName.blur, () => this.model.title = this.titleElement.value);
    }

    public titleChanged(value: string) {
        this.titleElement.value = value;
    }
}