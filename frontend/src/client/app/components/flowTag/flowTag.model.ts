import {YArray, YMap} from "../../../../yManagement/yManagement.types";
import {YComponentModel} from "../../../../yManagement/yModel/types/yComponentModel";
import {SyncedFlowPath} from "../flowPath/flowPath.types";
import {YUtilities} from "../../../../yManagement/yUtilities";
import {FlowPath} from "../flowPath/flowPath";

export class FlowTagModel extends YComponentModel {
    public get data(): any {
        return super.data;
    }

    public set data(value: any) {
        super.data = value;
        YUtilities.deepObserveAny(this.data, () => this.fireCallback("pathsChanged"), "paths");
    }

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
        if (!(pathData instanceof YMap)) pathData = FlowPath.createData(pathData);
        if (index == undefined || index >= this.pathsArray.length) return this.paths.push([pathData]);
        if (index < 0) index = 0;
        this.paths.insert(index, [pathData]);
    }
}