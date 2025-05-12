import {YArray, YMap} from "../../../../yManagement/yManagement.types";
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
import {FlowIntersectionHandler} from "./flow.intersectionHandler";
import {FlowTagsModel} from "./flow.tagsModel";
import {FlowTag} from "../flowTag/flowTag";
import {YUtilities} from "../../../../yManagement/yUtilities";

export class FlowModel extends YComponentModel {
    private _currentBranchId: string = "0";

    public readonly branchesModel: FlowBranchesModel;
    public readonly tagsModel: FlowTagsModel;

    // Added margin to the computed viewBox
    public readonly viewBoxPadding = 200 as const;
    // Rate at which the viewBox updates
    public readonly viewBoxUpdateRate = 200 as const;
    // Keeps track of the last time the viewBox was updated
    public lastViewBoxUpdate = 0;
    public lastViewBoxValues: Point = new Point();

    public onFlowBranchAdded: (data: SyncedFlowBranch) => FlowBranch;
    public onFlowTagAdded: (data: SyncedFlowTag) => FlowTag;

    public constructor(data: SyncedFlow) {
        super(data as YMap);
        this.branchesModel = new FlowBranchesModel();
        this.tagsModel = new FlowTagsModel();

    }

    public get data(): any {
        return super.data;
    }

    public set data(value: any) {
        super.data = value;

        this.branchesModel.data = this.getData("branches");
        this.branchesModel.onAdded = (data) => this.onFlowBranchAdded(data);

        this.tagsModel.data = this.tagsData;
        this.tagsModel.onAdded = (data) => this.onFlowTagAdded(data);

        YUtilities.deepObserveAll(this.data, () => this.fireCallback("__redraw"), "branches", "entries");
    }

    public get currentBranchId(): string {
        return this._currentBranchId;
    }

    public set currentBranchId(value: string) {
        this.currentBranch.redraw(true);
        this._currentBranchId = value;
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

    public get intersectionHandler(): FlowIntersectionHandler {
        return this.getHandler("intersection") as FlowIntersectionHandler;
    }

    public get branchesData(): YMap<SyncedFlowBranch> {
        return this.getData("branchesData") as YMap<SyncedFlowBranch>;
    }

    public get branchesDataArray(): SyncedFlowBranch[] {
        return this.branchesModel.getAllData() as SyncedFlowBranch[];
    }

    public get tagsData(): YArray<SyncedFlowTag> {
        return this.getData("tags");
    }

    public get tagsDataArray(): SyncedFlowTag[] {
        return this.tagsData.toArray();
    }

    public get defaultName(): string {
        return this.getData("defaultName");
    }

    public get branches(): FlowBranch[] {
        return this.branchesModel.getAllComponents();
    }

    public get tags(): FlowTag[] {
        return this.tagsModel.getAllComponents();
    }

    public get currentBranch(): FlowBranch {
        return this.branchesModel.getInstance(this.currentBranchId);
    }
}