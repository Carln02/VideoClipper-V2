import {Flow} from "../flow/flow";
import {FlowBranchProperties, SyncedFlowBranch} from "./flowBranch.types";
import {FlowBranchModel} from "./flowBranch.model";
import {FlowBranchView} from "./flowBranch.view";
import {Point, SvgNamespace, TurboProxiedElement} from "turbodombuilder";
import {YArray} from "../../../../yManagement/yManagement.types";
import {SyncedFlowEntry} from "../flowEntry/flowEntry.types";
import {FlowBranchSearchHandler} from "./flowBranch.searchHandler";
import {FlowBranchUpdateHandler} from "./flowBranch.updateHandler";
import {FlowPoint} from "../flow/flow.types";
import {FlowBranchPointHandler} from "./flowBranch.pointHandler";
import {FlowBranchEntryHandler} from "./flowBranch.entryHandler";
import {FlowBranchCleaningHandler} from "./flowBranch.cleaningHandler";

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
            handlerConstructors: [FlowBranchSearchHandler, FlowBranchUpdateHandler, FlowBranchPointHandler,
                FlowBranchEntryHandler, FlowBranchCleaningHandler]
        });

        this.model.flowId = this.flow?.dataId;
    }

    public get flowEntries(): YArray<SyncedFlowEntry> {
        return this.model.entries;
    }

    public get flowEntriesArray(): SyncedFlowEntry[] {
        return this.model.entriesArray;
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

    public getMaxPoint(): Point {
        return this.model.pointHandler.getMaxPoint();
    }

    /**
     * @description Finds the last flow entry inside the given node's ID
     * @param nodeId
     */
    public findNodeEntry(nodeId: string): FlowPoint {
        return this.model.searchHandler.findNodeEntry(nodeId);
    }

    /**
     * @description Finds the last flow entry inside the given node's ID
     * @param nodeId
     */
    public findNodeEntries(nodeId: string): FlowPoint[] {
        return this.model.searchHandler.findNodeEntries(nodeId);
    }

    /**
     * @description Finds the closest point in the flow to the given point
     * @param point
     */
    public findClosestPoint(point: Point): FlowPoint {
        return this.model.searchHandler.findClosestPoint(point);
    }

    public findPointFromIndex(index: number): FlowPoint {
        return this.model.searchHandler.findPointFromIndex(index);
    }

    public checkIfUnnecessary(): boolean {
        return this.model.cleaningHandler.checkIfUnnecessary();
    }

    public endBranch() {
        return this.model.cleaningHandler.endBranch();
    }

    public updateAfterMovingNode(nodeId: string, deltaPosition: Point) {
        return this.model.updateHandler.updateAfterMovingNode(nodeId, deltaPosition);
    }

    public get isOverwriting(): boolean {
        return this.model.isOverwriting;
    }

    public get overwriting(): string {
        return this.model.overwriting;
    }
}