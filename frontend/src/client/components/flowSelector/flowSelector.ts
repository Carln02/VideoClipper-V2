import {define} from "turbodombuilder";
import "./flowSelector.css";
import {FlowSelectorProperties, SyncedFlowSelector} from "./flowSelector.types";
import {VcComponent} from "../component/component";
import {FlowSelectorModel} from "./flowSelector.model";
import {FlowSelectorView} from "./flowSelector.view";
import {Project} from "../../directors/project/project";
import {YMap} from "../../../yManagement/yManagement.types";
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
        this.model.onPathAdded = (path) => this.view.addPathEntry(path);
        this.mvc.initialize();
        this.updatePaths();
    }

    public static createData(data?: SyncedFlowSelector): YMap & SyncedFlowSelector {
        if (!data) data = {};
        if (!data.nodeId) data.nodeId = "";
        if (!data.paths) data.paths = {};
        for (const key in data.paths) data.paths[key] = FlowPath.createData(data.paths[key]);
        data.paths = YUtilities.createYMap(data.paths);
        return YUtilities.createYMap<SyncedFlowSelector>(data);
    }

    public get attachedNode(): BranchingNode {
        return this.director.getNode(this.model.nodeId);
    }

    public get paths(): FlowPath[] {
        return this.model.paths;
    }

    public setPath(pathData: YMap & SyncedFlowPath, id?: string) {
        return this.model.setPath(pathData, id);
    }

    public updatePaths() {
        this.mvc.emitter.fire("update_paths");
    }
}