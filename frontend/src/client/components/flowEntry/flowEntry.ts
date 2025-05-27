import {YMap} from "../../../yManagement/yManagement.types";
import {YUtilities} from "../../../yManagement/yUtilities";
import {SplitEntryData, SyncedFlowEntry} from "./flowEntry.types";
import {FlowEntryModel} from "./flowEntry.model";
import {Coordinate, MvcHandler} from "turbodombuilder";

export class FlowEntry {
    protected mvc: MvcHandler;

    public static createData(data?: SyncedFlowEntry): YMap & SyncedFlowEntry {
        if (data instanceof YMap) return data;
        if (!data) data = {};
        if (!data.startNodeId) data.startNodeId = "";
        if (!data.endNodeId) data.endNodeId = "";
        if (!data.points) data.points = [];
        return YUtilities.createYMap(data);
    }

    public constructor(data: SyncedFlowEntry & YMap) {
        this.mvc = new MvcHandler({
            modelConstructor: FlowEntryModel,
            data: data,
            generate: true
        });
    }

    protected get model(): FlowEntryModel {
        return this.mvc.model as FlowEntryModel;
    }

    public get data(): SyncedFlowEntry & YMap {
        return this.model.data;
    }

    public set data(data: SyncedFlowEntry & YMap) {
        this.model.data = data;
    }

    public get startNodeId(): string {
        return this.model.startNodeId;
    }

    public set startNodeId(value: string) {
        this.model.startNodeId = value;
    }

    public get endNodeId(): string {
        return this.model.endNodeId;
    }

    public set endNodeId(value: string) {
        this.model.endNodeId = value;
    }

    public get points(): Coordinate[] {
        return this.model.points;
    }

    public addPoint(point: Coordinate) {
        return this.model.points.push(point);
    }

    public removePoint(index: number) {
        return this.model.removePoint(index);
    }

    public incrementPoint(index: number, increment: Coordinate) {
        return this.model.incrementPoint(index, increment);
    }

    /**
     * Splits an entry at the given point index into before/after + a new "split" entry.
     * Returns [beforeSplitEntry, splitEntry, afterSplitEntry].
     */
    public splitAtPoint(splitPointIndex: number, nodeId: string, splitPoint: Coordinate): SplitEntryData {

        // Create before/after
        const beforeSplit: SyncedFlowEntry = {
            startNodeId: this.startNodeId,
            endNodeId: nodeId,
            points: [...this.points.slice(0, splitPointIndex), splitPoint]
        };

        const afterSplit: SyncedFlowEntry = {
            startNodeId: nodeId,
            endNodeId: this.endNodeId,
            points: [splitPoint, ...this.points.slice(splitPointIndex + 1)]
        };

        // The newly inserted "middle" entry (splitEntry).
        const splitEntry: SyncedFlowEntry = {
            startNodeId: nodeId,
            endNodeId: nodeId,
            points: [splitPoint]
        };

        return {beforeSplit: beforeSplit, splitEntry: splitEntry, afterSplit: afterSplit};
    }
}