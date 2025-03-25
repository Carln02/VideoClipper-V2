import {Flow} from "../flow/flow";
import {FlowBranchProperties, SyncedFlowBranch} from "./flowBranch.types";
import {FlowBranchModel} from "./flowBranch.model";
import {FlowBranchView} from "./flowBranch.view";
import {Point, SvgNamespace, TurboProxiedElement} from "turbodombuilder";
import {YArray} from "../../../../yManagement/yManagement.types";
import {SyncedFlowEntry, SyncedFlowEntryData} from "../flowEntry/flowEntry.types";
import {FlowBranchSearchHandler} from "./flowBranch.searchHandler";
import {FlowBranchUpdateHandler} from "./flowBranch.updateHandler";
import {FlowBranchPointHandler} from "./flowBranch.pointHandler";

export class FlowBranch extends TurboProxiedElement<"g", FlowBranchView, SyncedFlowBranch, FlowBranchModel> {
    public readonly flow: Flow;

    public constructor(properties: FlowBranchProperties) {
        super({tag: "g", namespace: SvgNamespace});
        this.flow = properties.flow;
        this.flow?.svg.addChild(this.element);

        this.mvc.generate({
            viewConstructor: FlowBranchView,
            modelConstructor: FlowBranchModel,
            data: properties.data,
            handlerConstructors: [FlowBranchSearchHandler, FlowBranchUpdateHandler]
        });

        this.model.flowId = this.flow?.dataId;
    }

    public get flowEntries(): YArray<SyncedFlowEntry> {
        return this.model.flowEntries;
    }

    public get flowEntriesArray(): SyncedFlowEntry[] {
        return this.model.flowEntriesArray;
    }

    /**
     * @description Adds the provided point to the flow with the given ID. The node ID indicates the ID of the node
     * the point is in (or null), and isTemporary indicates whether the point is temporarily added to the flow as
     * part of user feedback (to not add it to the synced data).
     * @param p
     * @param nodeId
     * @param isTemporary
     */
    public addPoint(p: Point, nodeId?: string, isTemporary: boolean = false) {
        this.model.pointHandler.addPoint(p, nodeId, isTemporary);
    }
}