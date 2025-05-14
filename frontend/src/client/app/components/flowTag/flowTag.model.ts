import {YArray, YMap} from "../../../../yManagement/yManagement.types";
import {YComponentModel} from "../../../../yManagement/yModel/types/yComponentModel";
import {SyncedFlowPath} from "../flowPath/flowPath.types";
import {FlowPath} from "../flowPath/flowPath";
import {YManagerModel} from "../../../../yManagement/yModel/types/yManagerModel";
import {MvcBlockKeyType} from "turbodombuilder";
import {Flow} from "../flow/flow";

export class FlowTagModel extends YComponentModel {
    private pathsModel: YManagerModel<SyncedFlowPath, FlowPath, number, YArray>;
    public flow: Flow;

    public onPathAdded: (path: FlowPath, index: number) => void = () => {};

    public constructor(data?: any) {
        super(data);

        this.pathsModel = new YManagerModel();
        this.pathsModel.onAdded = (pathData: SyncedFlowPath & YMap, index: number) => {
            const path = new FlowPath({value: pathData.get("name"), data: pathData, flow: this.flow});
            this.onPathAdded?.(path, index);
            return path;
        }
    }

    public initialize(blockKey: MvcBlockKeyType<"map"> = this.defaultBlockKey) {
        super.initialize(blockKey);
        if (blockKey === this.defaultBlockKey) this.pathsModel.data = this.pathsData;
    }

    public get data(): any {
        return super.data;
    }

    public set data(value: any) {
        super.data = value;
        // YUtilities.deepObserveAny(this.data, () => this.fireCallback("pathsChanged"), "paths");
    }

    public get nodeId(): string {
        return this.getData("nodeId");
    }

    public set nodeId(value: string) {
        this.setData("nodeId", value);
    }

    public get pathsData(): YArray<SyncedFlowPath & YMap> {
        return this.getData("paths");
    }

    public set pathsData(value: YArray<SyncedFlowPath>) {
        this.setData("paths", value);
    }

    public get pathsDataArray(): (SyncedFlowPath & YMap)[] {
        return this.pathsData.toArray();
    }

    public get paths(): FlowPath[] {
        return this.pathsModel.getAllComponents();
    }

    public insertPath(pathData: YMap | SyncedFlowPath, index?: number) {
        if (!(pathData instanceof YMap)) pathData = FlowPath.createData(pathData);
        if (index == undefined || index >= this.pathsDataArray.length) return this.pathsData.push([pathData]);
        if (index < 0) index = 0;
        this.pathsData.insert(index, [pathData]);
    }
}