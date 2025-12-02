import {deepObserveAny, DefaultEventName, Direction, TurboIcon, TurboSelectWheel, TurboView} from "turbodombuilder";
import {FlowSelector} from "./flowSelector";
import {FlowSelectorModel} from "./flowSelector.model";
import {Playback} from "../playback/playback";
import FlowPath from "../flowPath/flowPath";
import {FlowSelectorMarkingMenu} from "../flowSelectorMarkingMenu/flowSelectorMarkingMenu";
import {Card} from "../card/card";

export class FlowSelectorView extends TurboView<FlowSelector, FlowSelectorModel> {
    // @ts-ignore
    private wheel: TurboSelectWheel<string, string, FlowPath>;
    private playButton: TurboIcon;

    private static markingMenu: FlowSelectorMarkingMenu;

    public addPathEntry(path: FlowPath) {
        this.wheel.addEntry(path);
        if (!this.wheel.selectedEntry) this.wheel.select(path);
    }

    protected setupUIElements() {
        super.setupUIElements();

        // @ts-ignore
        this.wheel = new TurboSelectWheel<string, string, FlowPath>({
            direction: Direction.vertical,
            values: [],
            forceSelection: true,
        }).setStyle("margin", 0);
        this.playButton = new TurboIcon({icon: "play", classes: "icon"});

        if (!FlowSelectorView.markingMenu) {
            FlowSelectorView.markingMenu = new FlowSelectorMarkingMenu();
            this.element.director.addChild(FlowSelectorView.markingMenu);
        }
    }

    protected setupUILayout() {
        super.setupUILayout();

        this.element.addChild([this.wheel, this.playButton]);
    }

    protected setupUIListeners() {
        super.setupUIListeners();
        this.playButton.addListener(DefaultEventName.click, () => this.playPath(this.wheel.selectedEntry));
        this.wheel.onSelect = () => this.updateHighlightedEntries();

        FlowSelectorView.markingMenu.attachSelector(this.element, this.wheel, this.element.director.getNode(this.model.nodeId) as Card);
    }

    protected setupChangedCallbacks() {
        super.setupChangedCallbacks();
        this.emitter.add("nodeId", () => this.element.attachedNode?.addChild(this.element));
        this.emitter.add("update_paths", () => {
            this.model.pathHandler.updatePaths();
            requestAnimationFrame(() => this.updateHighlightedEntries());
        });
        deepObserveAny(this.model.data, () => this.wheel.select(this.wheel.selectedEntry), "name");
    }

    private updateHighlightedEntries() {
        this.wheel.entries.forEach(entry => {
            if (entry === this.wheel.selectedEntry) return;
            entry.highlightEntries(false);
        });
        this.wheel.selectedEntry?.highlightEntries(true);
    }

    private playPath(path: FlowPath) {
        const playback = new Playback({
            director: this.element.director,
            path: path,
            parent: document.body,
            classes: "over-screen-playback"
        });
        playback.showControlButtons(true);
    }
}