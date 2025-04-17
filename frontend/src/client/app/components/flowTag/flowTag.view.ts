import {Direction, TurboSelectEntry, TurboSelectWheel, TurboView} from "turbodombuilder";
import {FlowTag} from "./flowTag";
import {FlowTagModel} from "./flowTag.model";
import {FlowPathModel} from "../flowPath/flowPath.model";

export class FlowTagView extends TurboView<FlowTag, FlowTagModel> {
    private wheel: TurboSelectWheel;

    protected setupUIElements() {
        super.setupUIElements();

        this.wheel = new TurboSelectWheel({direction: Direction.vertical}).setStyle("margin", 0);
        // this.regeneratePaths(false);
        // values: this.generateWheelEntries(),
    }

    protected setupUILayout() {
        super.setupUILayout();

        this.element.addChild(this.wheel);
    }

    protected setupChangedCallbacks() {
        super.setupChangedCallbacks();

        this.emitter.add("nodeId", () => {
            // console.log(this.element);
            // console.log(this.element.attachedNode);
            this.regenerateWheelEntries();
            // this.wheel.select(this.wheel.entries[0])
            // this.wheel.reset();
            this.element.attachedNode.addChild(this.element)
        });
        this.emitter.add("paths", () => this.regenerateWheelEntries());
     }

    private regenerateWheelEntries() {
        this.wheel.values = this.model.pathsArray.map(pathData => {
            const path = new FlowPathModel(pathData);
            return new TurboSelectEntry({
                value: path.name + (path.index < 2 ? "" : " - " + path.index),
                style: "padding: 6px; white-space: nowrap;",
                onSelected: (b: boolean) => {
                    if (!b) return;
                    //TODO this.flow.drawingHandler.highlightBranches(path.branchIndices);
                }
            });
        });
    }
}