import {YMap} from "../../../../yManagement/yManagement.types";
import {YUtilities} from "../../../../yManagement/yUtilities";
import {SyncedFlowEntry} from "./flowEntry.types";

export class FlowEntry {
    public static createData(data?: SyncedFlowEntry): YMap & SyncedFlowEntry {
        if (data instanceof YMap) return data;
        if (!data) data = {};
        if (!data.startNodeId) data.startNodeId = "";
        if (!data.endNodeId) data.endNodeId = "";
        if (!data.points) data.points = [];
        return YUtilities.createYMap(data);
    }
}