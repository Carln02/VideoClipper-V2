import {VcProperties} from "../component/component.types";
import {FlowSelectorView} from "./flowSelector.view";
import {FlowSelectorModel} from "./flowSelector.model";
import {Flow} from "../flow/flow";
import {SyncedFlowPath} from "../flowPath/flowPath.types";
import {Project} from "../../directors/project/project";
import {YMap} from "turbodombuilder";

/**
 * A flow tag might store a "nodeId" (as a root for traversal)
 * and "namedPaths" referencing branches.
 */
export type SyncedFlowSelector = {
    nodeId?: string;
    paths?: YMap<SyncedFlowPath> | Record<string, SyncedFlowPath>;
};

export type FlowSelectorProperties = VcProperties<FlowSelectorView, SyncedFlowSelector, FlowSelectorModel, Project> & {
    flow: Flow,
};