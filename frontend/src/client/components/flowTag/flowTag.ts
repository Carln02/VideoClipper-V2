import {define} from "turbodombuilder";
import "./flowTag.css";
import {FlowTagProperties, SyncedFlowTag} from "./flowTag.types";
import {VcComponent} from "../component/component";
import {FlowTagModel} from "./flowTag.model";
import {FlowTagView} from "./flowTag.view";
import {Project} from "../../screens/project/project";
import {YArray, YMap} from "../../../yManagement/yManagement.types";
import {SyncedFlowPath} from "../flowPath/flowPath.types";
import {FlowPath} from "../flowPath/flowPath";
import {YUtilities} from "../../../yManagement/yUtilities";
import {BranchingNode} from "../branchingNode/branchingNode";

@define("vc-flow-tag")
export class FlowTag extends VcComponent<FlowTagView, SyncedFlowTag, FlowTagModel, Project> {
    public constructor(properties: FlowTagProperties) {
        super(properties);
        this.mvc.generate({
            viewConstructor: FlowTagView,
            modelConstructor: FlowTagModel,
            data: properties.data,
            initialize: false
        });

        this.model.flow = properties.flow;
        this.model.onPathAdded = (path, index) => this.view.addPathEntry(path, index);
        this.mvc.initialize();
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
        return this.model.pathsData;
    }

    public get pathsArray(): (SyncedFlowPath & YMap)[] {
        return this.model.pathsDataArray;
    }

    public insertPath(pathData: YMap | SyncedFlowPath, index?: number) {
        return this.model.insertPath(pathData, index);
    }


}