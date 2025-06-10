import {SyncedFlow} from "../../components/flow/flow.types";
import {Flow} from "../../components/flow/flow";
import {YMap} from "../../../yManagement/yManagement.types";
import {YManagerModel} from "../../../yManagement/yModel/types/yManagerModel";

export class ProjectFlowsModel extends YManagerModel<SyncedFlow, Flow, string, YMap> {
}