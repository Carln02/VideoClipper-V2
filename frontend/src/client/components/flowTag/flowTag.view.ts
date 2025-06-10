import {DefaultEventName, Direction, TurboIcon, TurboSelectWheel, TurboView} from "turbodombuilder";
import {FlowTag} from "./flowTag";
import {FlowTagModel} from "./flowTag.model";
import {Playback} from "../playback/playback";
import {FlowPath} from "../flowPath/flowPath";

export class FlowTagView extends TurboView<FlowTag, FlowTagModel> {
    private wheel: TurboSelectWheel<string, string, FlowPath>;
    private playButton: TurboIcon;

    public addPathEntry(path: FlowPath, index: number) {
        this.wheel.addEntry(path, index);
        if (!this.wheel.selectedEntry) this.wheel.select(path);
    }

    protected setupUIElements() {
        super.setupUIElements();

        this.wheel = new TurboSelectWheel<string, string, FlowPath>({
            direction: Direction.vertical,
            values: [],
            forceSelection: true,
        }).setStyle("margin", 0);
        this.playButton = new TurboIcon({icon: "play", classes: "icon"});
    }

    protected setupUILayout() {
        super.setupUILayout();

        this.element.addChild([this.wheel, this.playButton]);
    }

    protected setupUIListeners() {
        super.setupUIListeners();
        this.playButton.addListener(DefaultEventName.click, () => this.playPath(this.wheel.selectedEntry));
    }

    protected setupChangedCallbacks() {
        super.setupChangedCallbacks();
        this.emitter.add("nodeId", () => this.element.attachedNode?.addChild(this.element));
    }

    private playPath(path: FlowPath) {
        new Playback({director: this.element.director, path: path, parent: document.body, classes: "over-screen-playback"});
    }
}