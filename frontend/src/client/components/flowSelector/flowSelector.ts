import {define} from "turbodombuilder";
import "./flowSelector.css";
import {FlowSelectorProperties, SyncedFlowSelector} from "./flowSelector.types";
import {VcComponent} from "../component/component";
import {FlowSelectorModel} from "./flowSelector.model";
import {FlowSelectorView} from "./flowSelector.view";
import {Project} from "../../directors/project/project";
import {YArray, YMap} from "../../../yManagement/yManagement.types";
import {SyncedFlowPath} from "../flowPath/flowPath.types";
import {FlowPath} from "../flowPath/flowPath";
import {YUtilities} from "../../../yManagement/yUtilities";
import {BranchingNode} from "../branchingNode/branchingNode";
import {FlowSelectorPathHandler} from "./flowSelector.pathHandler";

@define("vc-flow-selector")
export class FlowSelector extends VcComponent<FlowSelectorView, SyncedFlowSelector, FlowSelectorModel, Project> {
    public constructor(properties: FlowSelectorProperties) {
        super(properties);
        this.mvc.generate({
            viewConstructor: FlowSelectorView,
            modelConstructor: FlowSelectorModel,
            data: properties.data,
            handlerConstructors: [FlowSelectorPathHandler],
            initialize: false
        });

        this.model.flow = properties.flow;
        this.model.onPathAdded = (path, index) => this.view.addPathEntry(path, index);
        this.mvc.initialize();
    }

    public static createData(data?: SyncedFlowSelector): YMap & SyncedFlowSelector {
        if (!data) data = {};
        if (!data.nodeId) data.nodeId = "";
        if (!data.paths || data.paths.length === 0) data.paths = [undefined];
        data.paths = YUtilities.createYArray(data.paths.map(path => FlowPath.createData(path)));
        return YUtilities.createYMap<SyncedFlowSelector>(data);
    }

    public get attachedNode(): BranchingNode {
        return this.director.getNode(this.model.nodeId);
    }

    public get paths(): YArray<SyncedFlowPath & YMap> {
        return this.model.pathsData;
    }

    public get pathsArray(): (SyncedFlowPath & YMap)[] {
        return this.model.pathsDataArray;
    }

    public insertPath(pathData: YMap & SyncedFlowPath, index?: number) {
        return this.model.insertPath(pathData, index);
    }

    public updatePaths() {
        this.model.pathHandler.updatePaths();
    }
}