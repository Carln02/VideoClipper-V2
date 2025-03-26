import {TurboHandler} from "turbodombuilder";
import {FlowModel} from "./flow.model";
import {SyncedFlowBranch} from "../flowBranch/flowBranch.types";
import {FlowBranch} from "../flowBranch/flowBranch";

export class FlowBranchesHandler extends TurboHandler<FlowModel> {
    public getBranchById(id: string): FlowBranch {
        return this.model.branchesModel.getInstance(id);
    }

    public getBranchDataById(id: string): SyncedFlowBranch {
        return this.getBranchById(id).data;
    }

    public getBranchId(branch: FlowBranch): string {
        for (const [key, value] of this.model.branchesModel.data) {
            if (value == branch.data) return key;
        }
        return null;
    }

    public removeBranch(branch: FlowBranch) {
        if (branch.dataId) this.removeBranchAt(branch.dataId);
        else this.removeBranchAt(this.getBranchId(branch));
    }

    public removeBranchAt(id: string) {
        this.model.branchesModel.data.delete(id);
    }
}