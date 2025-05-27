import {SyncedFlowTag} from "../flowTag/flowTag.types";
import {FlowTag} from "../flowTag/flowTag";
import {YArray} from "../../../yManagement/yManagement.types";
import {YManagerModel} from "../../../yManagement/yModel/types/yManagerModel";

export class FlowTagsModel extends YManagerModel<SyncedFlowTag, FlowTag, number, YArray> {
}