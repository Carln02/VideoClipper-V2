import {BranchingNodeView} from "../branchingNode/branchingNode.view";
import {
    ClickMode,
    DefaultEventName,
    div, Open,
    Point,
    Side,
    TurboEvent,
    TurboEventName,
    TurboInput,
} from "turbodombuilder";
import {formatMmSs} from "../../../utils/time";
import {Card} from "./card";
import {CardModel} from "./card.model";
import {ClipRenderer} from "../clipRenderer/clipRenderer";
import {MetadataDrawer} from "../metadataDrawer/metadataDrawer";
import {Timeline} from "../timeline/timeline";
import {ClipTimeline} from "../timeline/clipTimeline/clipTimeline";

export class CardView extends BranchingNodeView<Card, CardModel> {
    private titleElement: TurboInput;
    private durationElement: HTMLDivElement;

    private _renderer: ClipRenderer;
    private _metadataDrawer: MetadataDrawer;
    private _timeline: Timeline;

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
        this.titleElement = new TurboInput({selectTextOnFocus: true});
        this.durationElement = div();

        this._renderer = new ClipRenderer({screenManager: this.element.screenManager});

        this._metadataDrawer = new MetadataDrawer({
            card: this.element,
            icon: "chevron",
            hideOverflow: true,
            offset: {[Open.open]: 12}
        });

        this._timeline = new ClipTimeline({
            drawerProperties: {
                icon: "chevron",
                side: Side.right,
                hideOverflow: true,
                offset: {[Open.open]: 12}
            },
            screenManager: this.element.screenManager,
            card: this.element,
            renderer: this.renderer,
        });
    }

    protected setupUILayout(): void {
        this.element.addChild([
            this.renderer,
            this.metadataDrawer,
            this.timeline,
            div({
                classes: "card-title",
                children: [this.titleElement, this.durationElement]
            })
        ]);
    }

    protected setupUIListeners(): void {
        this.titleElement.addEventListener(DefaultEventName.blur, () => this.model.title = this.titleElement.value);
    }

    protected setupChangedCallbacks() {
        super.setupChangedCallbacks();
        this.emitter.add("title", (value: string) => this.titleElement.value = value);
    }
}