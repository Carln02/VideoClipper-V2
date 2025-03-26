import {YArray} from "../../../../yManagement/yManagement.types";
import {YComponentModel} from "../../../../yManagement/yModel/types/yComponentModel";
import {SyncedFlow} from "./flow.types";
import {FlowBranchesModel} from "./flow.branchesModel";
import {SyncedFlowBranch} from "../flowBranch/flowBranch.types";
import {SyncedFlowTag} from "../flowTag/flowTag.types";
import {FlowBranch} from "../flowBranch/flowBranch";
import {Point} from "turbodombuilder";
import {FlowSearchHandler} from "./flow.searchHandler";
import {FlowBranchesHandler} from "./flow.branchesHandler";
import {FlowCleaningHandler} from "./flow.cleaningHandler";

export class FlowModel extends YComponentModel {
    public currentBranchId: string = "0";

    public readonly branchesModel: FlowBranchesModel;

    // Added margin to the computed viewBox
    public readonly viewBoxPadding = 200 as const;
    // Rate at which the viewBox updates
    public readonly viewBoxUpdateRate = 200 as const;
    // Keeps track of the last time the viewBox was updated
    public lastViewBoxUpdate = 0;
    public lastViewBoxValues: Point = new Point();

    public onFlowBranchAdded: (data: SyncedFlowBranch) => FlowBranch;

    public constructor(data: SyncedFlow) {
        super(data);
        this.branchesModel = new FlowBranchesModel();
        this.branchesModel.onAdded = (data) => this.onFlowBranchAdded(data);
    }

    public get data(): any {
        return super.data;
    }

    public set data(value: any) {
        super.data = value;
        this.branchesModel.data = this.getData("branches");

        this.data?.observeDeep(events => {
            for (const event of events) {
                if (event.path.includes("branches") && event.path.includes("entries")) {
                    this.fireCallback("__redraw");
                    break;
                }
            }
        });
    }

    public get searchHandler(): FlowSearchHandler {
        return this.getHandler("search") as FlowSearchHandler;
    }

    public get branchHandler(): FlowBranchesHandler {
        return this.getHandler("branches") as FlowBranchesHandler;
    }

    public get cleaningHandler(): FlowCleaningHandler {
        return this.getHandler("cleaning") as FlowCleaningHandler;
    }

    public get tags(): YArray<SyncedFlowTag> {
        return this.getData("tags");
    }

    public get tagsArray(): SyncedFlowTag[] {
        return this.tags.toArray();
    }

    public get defaultName(): string {
        return this.getData("defaultName");
    }

    public get branches(): FlowBranch[] {
        return this.branchesModel.getAllComponents();
    }

    public get branchesData(): SyncedFlowBranch[] {
        return this.branchesModel.getAllData() as SyncedFlowBranch[];
    }

    public get currentBranch(): FlowBranch {
        return this.branchesModel.getInstance(this.currentBranchId);
    }
}