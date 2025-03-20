import {YArray} from "../../../../yManagement/yManagement.types";
import {YComponentModel} from "../../../../yManagement/yModel/types/yComponentModel";
import {SyncedFlow} from "./flow.types";
import {FlowBranchesModel} from "./fow.branchesModel";
import {SyncedFlowBranch} from "../flowBranch/flowBranch.types";
import {SyncedFlowTag} from "../flowTag/flowTag.types";

export class FlowModel extends YComponentModel {
    private readonly branchesModel: FlowBranchesModel;

    public constructor(data: SyncedFlow) {
        super(data);
        this.branchesModel = new FlowBranchesModel(this.getData("branches"));
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

    public getAllBranches(): SyncedFlowBranch[] {
        return this.branchesModel.getAllBranches();
    }

    public getBranchById(id: string): SyncedFlowBranch {
        return this.branchesModel.getBranchById(id);
    }

    public getSvgGroupById(id: string): SVGGElement {
        return this.branchesModel.getSvgGroupById(id);
    }
}