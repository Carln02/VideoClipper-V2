import {BranchingNodeView} from "../branchingNode/branchingNode.view";
import {
    ClickMode,
    DefaultEventName,
    div,
    Point,
    TurboEvent,
    TurboEventName,
    TurboInput,
} from "turbodombuilder";
import {formatMmSs} from "../../../utils/time";
import {Card} from "./card";
import {CardModel} from "./card.model";

export class CardView extends BranchingNodeView<Card, CardModel> {
    private titleElement: TurboInput;
    private durationElement: HTMLDivElement;

    public constructor(element: Card, model: CardModel) {
        super(element, model);
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

    protected setupChangedCallbacks() {
        super.setupChangedCallbacks();
        this.setChangedCallback("title", (value: string) => this.titleElement.value = value);
    }

    protected setupUIElements(): void {
        this.titleElement = new TurboInput({selectTextOnFocus: true});
        this.durationElement = div();
    }

    protected setupUILayout(): void {
        this.element.addChild([
            this.element.renderer,
            this.element.metadataDrawer,
            this.element.timeline,
            div({
                classes: "card-title",
                children: [this.titleElement, this.durationElement]
            })
        ]);
    }

    protected setupUIListeners(): void {
        this.element.addEventListener(DefaultEventName.clickStart, () => this.element.bringToFront());
        this.titleElement.addEventListener(DefaultEventName.blur, () => this.model.title = this.titleElement.value);
    }
}