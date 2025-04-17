import {SyncedFlowPath} from "./flowPath.types";
import {YUtilities} from "../../../../yManagement/yUtilities";

export class FlowPath {
    public static createData(data?: SyncedFlowPath) {
        if (!data) data = {};
        if (!data.name) data.name = "Flow Path";
        if (!data.index) data.index = 1;
        data.branchIds = YUtilities.createYArray(data.branchIds ? data.branchIds : ["0"]) as any;
        return YUtilities.createYMap(data);
    }
}