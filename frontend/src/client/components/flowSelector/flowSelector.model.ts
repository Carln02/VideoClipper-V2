import {YMap} from "../../../yManagement/yManagement.types";
import {YComponentModel} from "../../../yManagement/yModel/types/yComponentModel";
import {SyncedFlowPath} from "../flowPath/flowPath.types";
import {FlowPath} from "../flowPath/flowPath";
import {YManagerModel} from "../../../yManagement/yModel/types/yManagerModel";
import {MvcBlockKeyType} from "turbodombuilder";
import {Flow} from "../flow/flow";
import {FlowSelectorPathHandler} from "./flowSelector.pathHandler";
import {randomString} from "../../utils/random";

export class FlowSelectorModel extends YComponentModel {
    private pathsModel: YManagerModel<SyncedFlowPath, FlowPath, string, YMap>;
    public flow: Flow;

    public onPathAdded: (path: FlowPath, id: string) => void = () => {};

    public constructor(data?: any) {
        super(data);

        this.pathsModel = new YManagerModel();
        this.pathsModel.onAdded = (pathData: SyncedFlowPath & YMap, id: string) => {
            console.log("ADDEDDDDDDD");
            const path = new FlowPath({value: pathData.get("name"), data: pathData, flow: this.flow});
            this.onPathAdded?.(path, id);
            return path;
        }
    }

    public initialize(blockKey: MvcBlockKeyType<"map"> = this.defaultBlockKey) {
        super.initialize(blockKey);
        if (blockKey === this.defaultBlockKey) this.pathsModel.data = this.pathsData;
    }

    // public get data(): any {
    //     return super.data;
    // }
    //
    // public set data(value: any) {
    //     super.data = value;
    //     // YUtilities.deepObserveAny(this.data, () => this.fireCallback("pathsChanged"), "paths");
    // }

    public get nodeId(): string {
        return this.getData("nodeId");
    }

    public set nodeId(value: string) {
        this.setData("nodeId", value);
    }

    public get pathsData(): YMap<SyncedFlowPath & YMap> {
        return this.getData("paths");
    }

    public set pathsData(value: YMap<SyncedFlowPath>) {
        this.setData("paths", value);
    }

    public get paths(): FlowPath[] {
        return this.pathsModel.getAllComponents();
    }

    public setPath(pathData: SyncedFlowPath, id?: string) {
        if (!id || typeof id !== "string") {
            const paths = this.pathsData.toJSON();
            do id = randomString();
            while (paths[id]);
        }
        if (!(pathData instanceof YMap)) pathData = FlowPath.createData(pathData);
        this.pathsData.set(id, pathData as YMap);
    }

    public removePath(id: string) {
        console.log("REMOVE PATH");
        if (!id || typeof id !== "string") return;
        this.pathsData.delete(id);
    }

    public get pathHandler(): FlowSelectorPathHandler {
        return this.getHandler("path") as FlowSelectorPathHandler;
    }
}