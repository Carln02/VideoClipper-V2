import {TurboRichElementProperties, TurboView, YMap} from "turbodombuilder";
import {FlowPathModel} from "./flowPath.model";
import {Flow} from "../flow/flow";

/**
 * A named path is now a sequence of branch references, indicating
 * which branches form a complete user-labeled route.
 * "branchIds" points to the branches in the order they are traversed.
 */
export type SyncedFlowPath = {
    name?: string,
    nodeIds?: string[],
};

export type FlowPathProperties = TurboRichElementProperties<"input", TurboView, SyncedFlowPath & YMap, FlowPathModel> & {
    flow: Flow;
};