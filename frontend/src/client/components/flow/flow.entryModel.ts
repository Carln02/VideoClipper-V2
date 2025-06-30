import {YManagerModel} from "../../../yManagement/yModel/types/yManagerModel";
import {YMap} from "../../../yManagement/yManagement.types";
import {SyncedFlowEntry} from "../flowEntry/flowEntry.types";
import {FlowEntry} from "../flowEntry/flowEntry";

export class FlowEntryModel extends YManagerModel<SyncedFlowEntry, FlowEntry, string, YMap> {
}