import {SyncedFlowBranch} from "./flow.types";
import {YMapManagerModel} from "../../../../yManagement/yModel/types/yManagerModel/types/yMapManagerModel";

export class FlowBranchesModel extends YMapManagerModel<SyncedFlowBranch, SVGGElement> {
    public getAllBranches(): SyncedFlowBranch[] {
        return this.getAllData() as SyncedFlowBranch[];
    }

    public getBranchById(id: string): SyncedFlowBranch {
        return this.getData(id);
    }

    public getSvgGroupById(id: string): SVGGElement {
        return this.getInstance(id);
    }
}