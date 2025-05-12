import {FlowPathProperties, SyncedFlowPath} from "./flowPath.types";
import {YUtilities} from "../../../../yManagement/yUtilities";
import {FlowPathModel} from "./flowPath.model";
import {define, TurboSelectEntry, TurboView} from "turbodombuilder";
import {YArray, YMap} from "../../../../yManagement/yManagement.types";
import {FlowPathEntryCardHandler} from "./flowPath.entryCardHandler";

@define()
export class FlowPath extends TurboSelectEntry<string, string, "p", TurboView, SyncedFlowPath & YMap, FlowPathModel> {
    public static createData(data?: SyncedFlowPath) {
        if (!data) data = {};
        if (!data.name) data.name = "Flow Path";
        data.branchIds = YUtilities.createYArray(data.branchIds ? data.branchIds : ["0"]) as any;
        data.cardIds = YUtilities.createYArray([]) as any;
        return YUtilities.createYMap(data);
    }

    public constructor(properties: FlowPathProperties) {
        super(properties);
        this.mvc.generate({
            modelConstructor: FlowPathModel,
            handlerConstructors: [FlowPathEntryCardHandler],
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
            if (!b) return;
            this.model.flow.branches.forEach(branch =>
                branch.highlighted = this.branchIdsArray.includes(branch.dataId));
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

    public get branchIds(): YArray<string> {
        return this.model.branchIds;
    }

    public set branchIds(value: YArray<string>) {
        this.model.branchIds = value;
    }

    public get branchIdsArray(): string[] {
        return this.model.branchIdsArray;
    }

    public get cardIds(): YArray<string> {
        return this.model.cardIds;
    }

    public get cardIdsArray(): string[] {
        return this.model.cardIdsArray;
    }

    public insertBranchAt(branchId: string, index?: number) {
        return this.model.insertBranchAt(branchId, index);
    }
}