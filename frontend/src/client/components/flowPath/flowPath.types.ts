import {TurboSelectEntryProperties, TurboView} from "turbodombuilder";
import {YMap} from "../../../yManagement/yManagement.types";
import {FlowPathModel} from "./flowPath.model";
import {Flow} from "../flow/flow";

/**
 * A named path is now a sequence of branch references, indicating
 * which branches form a complete user-labeled route.
 * "branchIds" points to the branches in the order they are traversed.
 */
export type SyncedFlowPath = {
    name?: string,
    branchIds?: string[],
    cardIds?: string[],
};

export type FlowPathProperties = TurboSelectEntryProperties<string, string, "p", TurboView, SyncedFlowPath & YMap, FlowPathModel> & {
    flow: Flow;
};