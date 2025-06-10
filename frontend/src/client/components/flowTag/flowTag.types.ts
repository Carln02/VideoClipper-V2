import {YArray} from "../../../yManagement/yManagement.types";
import {VcComponentProperties} from "../component/component.types";
import {FlowTagView} from "./flowTag.view";
import {FlowTagModel} from "./flowTag.model";
import {Flow} from "../flow/flow";
import {SyncedFlowPath} from "../flowPath/flowPath.types";
import {Project} from "../../directors/project/project";

/**
 * A flow tag might store a "nodeId" (as a root for traversal)
 * and "namedPaths" referencing branches.
 */
export type SyncedFlowTag = {
    nodeId?: string;
    paths?: YArray<SyncedFlowPath> | SyncedFlowPath[];
};

export type FlowTagProperties = VcComponentProperties<FlowTagView, SyncedFlowTag, FlowTagModel, Project> & {
    flow: Flow,
};