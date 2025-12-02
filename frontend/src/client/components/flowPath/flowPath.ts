import {FlowPathProperties, SyncedFlowPath} from "./flowPath.types";
import {FlowPathModel} from "./flowPath.model";
import {
    createYArray,
    createYMap,
    DefaultEventName,
    define,
    input,
    TurboRichElement,
    TurboView, YArray,
    YMap
} from "turbodombuilder";
import "./flowPath.css";

@define()
class FlowPath extends TurboRichElement<"input", TurboView, SyncedFlowPath & YMap, FlowPathModel> {
    public static createData(data?: SyncedFlowPath) {
        if (!data) data = {};
        if (!data.name) data.name = "Flow Path";
        data.nodeIds = createYArray(data.nodeIds ?? []) as any;
        return createYMap(data);
    }

    public constructor(properties: FlowPathProperties) {
        properties.element = input({type: "text"});
        super(properties);
        this.mvc.generate({
            modelConstructor: FlowPathModel,
            data: properties.data,
            initialize: false
        });

        this.model.flow = properties.flow;
        this.mvc.emitter.add("name", () => {
            this.element.size = Math.max(this.name.length - 4, 0);
            this.value = this.model.name;
            this.element.value = this.model.name;
        });

        this.mvc.initialize();
        this.initializeUI();
    }

    protected setupUIListeners() {
        this.element.addListener(DefaultEventName.input, () => this.name = this.element.value || "");
        this.addListener(DefaultEventName.click, (e) => {
            if (!this.selected) return;
            this.element.focus();
        });
        document.addListener(DefaultEventName.clickStart, () => this.element.blur());
    }

    public get name(): string {
        return this.model.name;
    }

    public set name(value: string) {
        this.model.name = value;
    }

    public get index(): number {
        return this.model.index;
    }

    public set index(value: number) {
        this.model.index = value;
    }

    public get nodeIds(): YArray<string> {
        return this.model.nodeIds;
    }

    public get nodeIdsArray(): string[] {
        return this.model.nodeIdsArray;
    }

    public highlightEntries(b: boolean) {
        this.model.flow.getEntriesFromNodesList(this.nodeIdsArray).forEach(entry => entry.highlighted = b);
    }

    public hasNode(id: string): boolean {
        return this.nodeIdsArray.includes(id);
    }
}

export default FlowPath