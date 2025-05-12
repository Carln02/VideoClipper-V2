import {DefaultEventName, Direction, TurboIcon, TurboSelectWheel, TurboView} from "turbodombuilder";
import {FlowTag} from "./flowTag";
import {FlowTagModel} from "./flowTag.model";
import {Playback} from "../playback/playback";
import {FlowPath} from "../flowPath/flowPath";

export class FlowTagView extends TurboView<FlowTag, FlowTagModel> {
    private wheel: TurboSelectWheel<string, string, FlowPath>;
    private playButton: TurboIcon;

    protected setupUIElements() {
        super.setupUIElements();

        this.wheel = new TurboSelectWheel<string, string, FlowPath>({direction: Direction.vertical, values: ["hi"]}).setStyle("margin", 0);
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

        this.element.onAttach = () => this.regenerateWheelEntries();
        this.emitter.add("pathsChanged", () => this.regenerateWheelEntries());
        this.emitter.add("nodeId", () => requestAnimationFrame(() => this.element.attachedNode.addChild(this.element)));
     }

    private regenerateWheelEntries() {
        this.wheel.values = this.model.pathsArray.map(pathData =>
            new FlowPath({data: pathData, value: pathData.get("name"), flow: this.element.flow}));
    }

    private playPath(path: FlowPath) {
        new Playback({screenManager: this.element.screenManager, path: path, parent: document.body});
    }
}