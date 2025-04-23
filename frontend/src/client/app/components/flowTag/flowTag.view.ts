import {Direction, TurboSelectEntry, TurboSelectWheel, TurboView} from "turbodombuilder";
import {FlowTag} from "./flowTag";
import {FlowTagModel} from "./flowTag.model";
import {FlowPathModel} from "../flowPath/flowPath.model";

export class FlowTagView extends TurboView<FlowTag, FlowTagModel> {
    private wheel: TurboSelectWheel;

    protected setupUIElements() {
        super.setupUIElements();

        this.wheel = new TurboSelectWheel({direction: Direction.vertical, values: ["hi"]}).setStyle("margin", 0);
    }

    protected setupUILayout() {
        super.setupUILayout();

        this.element.addChild(this.wheel);
    }

    protected setupChangedCallbacks() {
        super.setupChangedCallbacks();

        this.emitter.add("pathsChanged", () => this.regenerateWheelEntries());
        this.emitter.add("nodeId", () => requestAnimationFrame(() => this.element.attachedNode.addChild(this.element)));
        this.emitter.add("paths", () => this.regenerateWheelEntries());
     }

    private regenerateWheelEntries() {
        this.wheel.reifect.detach(...this.wheel.entries); //TODO MOVE TO TURBODOMBUILDER
        this.wheel.values = this.model.pathsArray.map(pathData => {
            const path = new FlowPathModel(pathData);
            return new TurboSelectEntry({value: path.name,
                onSelected: (b: boolean) => {
                    if (!b) return;
                    console.log(path.data);
                    //TODO this.flow.drawingHandler.highlightBranches(path.branchIndices);
                }
            }).setStyle("padding", "6px").setStyle("whiteSpace", "nowrap");
        });
    }
}