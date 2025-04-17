import { YArray, YMap } from "../../../../yManagement/yManagement.types";
import {YComponentModel} from "../../../../yManagement/yModel/types/yComponentModel";
import {SyncedFlowPath} from "../flowPath/flowPath.types";
import {YUtilities} from "../../../../yManagement/yUtilities";

export class FlowTagModel extends YComponentModel {
    public get nodeId(): string {
        return this.getData("nodeId");
    }

    public set nodeId(value: string) {
        this.setData("nodeId", value);
    }

    public get paths(): YArray<SyncedFlowPath & YMap> {
        return this.getData("paths");
    }

    public set paths(value: YArray<SyncedFlowPath>) {
        this.setData("paths", value);
    }

    public get pathsArray(): (SyncedFlowPath & YMap)[] {
        return this.paths.toArray();
    }

    public insertPath(pathData: YMap | SyncedFlowPath, index?: number) {
        if (!(pathData instanceof YMap)) pathData = YUtilities.createYMap(pathData);
        if (index == undefined || index >= this.pathsArray.length) return this.paths.push([pathData]);
        if (index < 0) index = 0;
        this.paths.insert(index, [pathData]);
    }
}