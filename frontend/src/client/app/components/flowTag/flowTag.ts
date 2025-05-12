import {define} from "turbodombuilder";
import "./flowTag.css";
import {BranchingNode} from "../branchingNode/branchingNode";
import {Flow} from "../flow/flow";
import {FlowTagProperties, SyncedFlowTag} from "./flowTag.types";
import {VcComponent} from "../component/component";
import {FlowTagModel} from "./flowTag.model";
import {FlowTagView} from "./flowTag.view";
import {DocumentManager} from "../../managers/documentManager/documentManager";
import {YArray, YMap} from "../../../../yManagement/yManagement.types";
import {SyncedFlowPath} from "../flowPath/flowPath.types";
import {FlowPath} from "../flowPath/flowPath";
import {YUtilities} from "../../../../yManagement/yUtilities";

@define("vc-flow-tag")
export class FlowTag extends VcComponent<FlowTagView, SyncedFlowTag, FlowTagModel, DocumentManager> {
    public readonly flow: Flow;

    public constructor(properties: FlowTagProperties) {
        super(properties);
        this.flow = properties.flow;
        this.mvc.generate({
            viewConstructor: FlowTagView,
            modelConstructor: FlowTagModel,
            data: properties.data
        });
    }

    public static createData(data?: SyncedFlowTag): YMap & SyncedFlowTag {
        if (!data) data = {};
        if (!data.nodeId) data.nodeId = "";
        if (!data.paths || data.paths.length === 0) data.paths = [undefined];
        data.paths = YUtilities.createYArray(data.paths.map(path => FlowPath.createData(path)));
        return YUtilities.createYMap<SyncedFlowTag>(data);
    }

    public get attachedNode(): BranchingNode {
        return this.screenManager.getNode(this.model.nodeId);
    }

    public get paths(): YArray<SyncedFlowPath & YMap> {
        return this.model.paths;
    }

    public get pathsArray(): (SyncedFlowPath & YMap)[] {
        return this.model.pathsArray;
    }

    public insertPath(pathData: YMap | SyncedFlowPath, index?: number) {
        return this.model.insertPath(pathData, index);
    }


}