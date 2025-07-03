import {FlowPathProperties, SyncedFlowPath} from "./flowPath.types";
import {YUtilities} from "../../../yManagement/yUtilities";
import {FlowPathModel} from "./flowPath.model";
import {define, TurboSelectEntry, TurboView} from "turbodombuilder";
import {YArray, YMap} from "../../../yManagement/yManagement.types";

@define()
export class FlowPath extends TurboSelectEntry<string, string, "p", TurboView, SyncedFlowPath & YMap, FlowPathModel> {
    public static createData(data?: SyncedFlowPath) {
        if (!data) data = {};
        if (!data.name) data.name = "Flow Path";
        data.nodeIds = YUtilities.createYArray(data.nodeIds ?? []) as any;
        return YUtilities.createYMap(data);
    }

    public constructor(properties: FlowPathProperties) {
        super(properties);
        this.mvc.generate({
            modelConstructor: FlowPathModel,
            data: properties.data,
            initialize: false
        });

        this.model.flow = properties.flow;
        this.mvc.emitter.add("name", () => this.value = this.model.name);
        this.mvc.initialize();
        this.initializeUI();
    }

    public initializeUI() {
        super.initializeUI();
        this.setStyle("padding", "6px").setStyle("whiteSpace", "nowrap");
    }

    protected setupUIListeners() {
        super.setupUIListeners();

        this.onSelected = (b: boolean) => {
            // this.model.flow.branches?.forEach(branch => {
            //     branch.highlighted = this.branchIdsArray?.includes(branch.dataId)
            // });
            // if (!b) return;
            // this.model.flow.branches?.forEach(branch =>
            //     branch.highlighted = this.branchIdsArray?.includes(branch.dataId));
        };
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
}