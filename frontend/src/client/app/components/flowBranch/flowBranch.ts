import {Flow} from "../flow/flow";
import {FlowBranchProperties, SyncedFlowBranch} from "./flowBranch.types";
import {FlowBranchModel} from "./flowBranch.model";
import {FlowBranchView} from "./flowBranch.view";
import {Point, SvgNamespace, TurboProxiedElement} from "turbodombuilder";
import {YArray, YMap} from "../../../../yManagement/yManagement.types";
import {SyncedFlowEntry} from "../flowEntry/flowEntry.types";
import {FlowBranchSearchHandler} from "./flowBranch.searchHandler";
import {FlowBranchUpdateHandler} from "./flowBranch.updateHandler";
import {FlowIntersection, FlowPoint} from "../flow/flow.types";
import {FlowBranchPointHandler} from "./flowBranch.pointHandler";
import {FlowBranchEntryHandler} from "./flowBranch.entryHandler";
import {FlowBranchCleaningHandler} from "./flowBranch.cleaningHandler";
import {FlowBranchIntersectionHandler} from "./flowBranch.intersectionHandler";
import {YUtilities} from "../../../../yManagement/yUtilities";
import {FlowEntry} from "../flowEntry/flowEntry";

export class FlowBranch extends TurboProxiedElement<"g", FlowBranchView, SyncedFlowBranch, FlowBranchModel> {
    public constructor(properties: FlowBranchProperties) {
        super({tag: "g", namespace: SvgNamespace});
        this.mvc.generate({
            viewConstructor: FlowBranchView,
            modelConstructor: FlowBranchModel,
            data: properties.data,
            handlerConstructors: [FlowBranchSearchHandler, FlowBranchUpdateHandler, FlowBranchPointHandler,
                FlowBranchEntryHandler, FlowBranchCleaningHandler, FlowBranchIntersectionHandler],
            initialize: false
        });

        this.model.flow = properties.flow;
        this.model.flow?.svg.addChild(this.element);
        this.model.flowId = this.model.flow?.dataId;
        this.mvc.initialize();
    }

    public static createData(data?: SyncedFlowBranch): YMap & SyncedFlowBranch {
        if (!data) data = {};
        if (!data.entries) data.entries = [];
        if (!data.connectedBranches) data.connectedBranches = [];
        if (!data.overwriting) data.overwriting = "";

        data.entries = YUtilities.createYArray(data.entries.map(entry => FlowEntry.createData(entry)));
        data.connectedBranches = YUtilities.createYArray(data.connectedBranches as string[]);

        return YUtilities.createYMap(data) as YMap & SyncedFlowBranch;
    }

    public get flow(): Flow {
        return this.model.flow;
    }

    public get entries(): YArray<SyncedFlowEntry> {
        return this.model.entries;
    }

    public get entriesArray(): SyncedFlowEntry[] {
        return this.model.entriesArray;
    }

    public get connectedBranches(): YArray<string> {
        return this.model.connectedBranches;
    }

    public get isOverwriting(): boolean {
        return this.model.isOverwriting;
    }

    public get overwriting(): string {
        return this.model.overwriting;
    }

    public redraw(force: boolean = false) {
        return this.view.redraw(force);
    }

    public getEntry(index: number): SyncedFlowEntry & YMap {
        return this.model.entryHandler.getEntry(index);
    }

    public spliceEntries(start: number, deleteCount?: number, ...entries: SyncedFlowEntry[]) {
        return this.model.entryHandler.spliceEntries(start, deleteCount, ...entries);
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

    public updateOnDetachingNode(nodeId: string) {
        return this.model.updateHandler.updateOnDetachingNode(nodeId);
    }

    public intersectsPoint(point: Point, errorMargin: number = 50, incrementValue: number = 1): boolean {
        return this.model.intersectionHandler.intersectsPoint(point, errorMargin, incrementValue);
    }

    public intersectsArea(topLeft: Point, size: Point): boolean {
        return this.model.intersectionHandler.intersectsArea(topLeft, size);
    }

    public closestPointOnPath(p: Point, closestPoint: FlowIntersection, errorMargin: number = 50, incrementValue: number = 10): FlowIntersection {
        return this.model.intersectionHandler.closestPointOnPath(p, closestPoint, errorMargin, incrementValue);
    }

    public setConnectedBranches(branches: string[] | YArray<string>) {
        return this.model.connectionHandler.setConnectedBranches(branches);
    }

    public addConnectedBranch(...branches: string[]) {
        return this.model.connectionHandler.addConnectedBranch(...branches);
    }
}