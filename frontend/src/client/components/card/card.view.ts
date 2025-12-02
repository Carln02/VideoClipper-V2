import {BranchingNodeView} from "../branchingNode/branchingNode.view";
import {
    ClickMode,
    DefaultEventName,
    div, effect, Open,
    Side, turbo,
    TurboEvent,
    TurboEventName, turboInput,
    TurboInput,
} from "turbodombuilder";
import {formatMmSs} from "../../utils/time";
import {Card} from "./card";
import {CardModel} from "./card.model";
import {ClipRenderer} from "../clipRenderer/clipRenderer";
import {metadataDrawer, MetadataDrawer} from "../metadataDrawer/metadataDrawer";
import {Timeline} from "../timeline/timeline";
import {clipTimeline} from "../timeline/clipTimeline/clipTimeline";
import {playback, Playback} from "../playback/playback";
import {CardMarkingMenu} from "../cardMarkingMenu/cardMarkingMenu";

export class CardView extends BranchingNodeView<Card, CardModel> {
    private titleElement: TurboInput;
    private durationElement: HTMLDivElement;

    public playback: Playback;
    private _metadataDrawer: MetadataDrawer;
    private _timeline: Timeline;

    // private static markingMenu: CardMarkingMenu;

    public get renderer(): ClipRenderer {
        return this.playback.renderer;
    }

    public get metadataDrawer(): MetadataDrawer {
        return this._metadataDrawer;
    }

    public get timeline(): Timeline {
        return this._timeline;
    }

    /**
     * @function editTitle
     * @description Focuses the title field of the card.
     */
    public editTitle() {
        this.titleElement.element.dispatchEvent(new TurboEvent({clickMode: ClickMode.left, eventName: TurboEventName.click}));
    }

    protected setupUIElements(): void {
        super.setupUIElements();
        this.titleElement = turboInput({selectTextOnFocus: true});
        this.durationElement = div();

        this.playback = playback({director: this.element.director, classes: "card-playback"});
        this.playback.timeline.scaled = true;

        this._metadataDrawer = metadataDrawer({
            card: this.element,
            icon: "chevron",
            hideOverflow: true,
            side: Side.bottom,
            offset: {[Open.open]: 12}
        });

        this._timeline = clipTimeline({
            drawerProperties: {
                icon: "chevron",
                side: Side.right,
                hideOverflow: true,
                offset: {[Open.open]: 12}
            },
            director: this.element.director,
            renderer: this.renderer,
            card: this.element,
            model: this.playback.timeline.model,
            hasControls: false
        });

       // if (!CardView.markingMenu) {
       //     CardView.markingMenu = new CardMarkingMenu();
       //     turbo(this.element.director).addChild(CardView.markingMenu);
       // }
    }

    protected setupUILayout(): void {
        super.setupUILayout();
        turbo(this).addChild([
            this.playback,
            this.metadataDrawer,
            this.timeline,
            div({
                classes: "card-title",
                children: [this.titleElement, this.durationElement]
            })
        ]);
    }

    protected setupUIListeners(): void {
        super.setupUIListeners();
        this.titleElement.addEventListener(DefaultEventName.blur, () => this.model.title = this.titleElement.value);
        // CardView.markingMenu.attachCard(this.element);
    }

    @effect private updateTitle() {
        this.titleElement.value = this.model.title ?? "";
    }

    @effect public updateDuration() {
        this.durationElement.textContent = formatMmSs(this.model.duration);
    }
}