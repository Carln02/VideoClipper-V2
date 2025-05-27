import {SyncedFlowBranch} from "../flowBranch/flowBranch.types";
import {FlowBranch} from "../flowBranch/flowBranch";
import {YManagerModel} from "../../../yManagement/yModel/types/yManagerModel";
import {YMap} from "../../../yManagement/yManagement.types";

export class FlowBranchesModel extends YManagerModel<SyncedFlowBranch, FlowBranch, string, YMap> {
}