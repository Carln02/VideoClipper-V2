import {YMap} from "../../../yManagement/yManagement.types";
import {YUtilities} from "../../../yManagement/yUtilities";
import {FlowEntryProperties, SplitEntryData, SyncedFlowEntry} from "./flowEntry.types";
import {FlowEntryModel} from "./flowEntry.model";
import {Coordinate, Point, SvgNamespace, TurboProxiedElement} from "turbodombuilder";
import {FlowEntryView} from "./flowEntry.view";
import {FlowIntersection} from "../flow/flow.types";
import {FlowEntryIntersectionHandler} from "./flowEntry.intersectionHandler";
import {FlowEntryPointHandler} from "./flowEntry.pointHandler";
import {FlowEntryUpdateHandler} from "./flowEntry.updateHandler";

export class FlowEntry extends TurboProxiedElement<"g", FlowEntryView, SyncedFlowEntry & YMap, FlowEntryModel> {
    public constructor(properties: FlowEntryProperties) {
        super({tag: "g", namespace: SvgNamespace});
        this.mvc.generate({
            viewConstructor: FlowEntryView,
            modelConstructor: FlowEntryModel,
            data: properties.data,
            handlerConstructors: [FlowEntryIntersectionHandler, FlowEntryPointHandler, FlowEntryUpdateHandler],
            initialize: false
        });

        console.log(properties.data);

        this.model.flow = properties.flow;
        this.model.flow?.svg.addChild(this.element);

        this.mvc.initialize();
    }

    public static createData(data?: SyncedFlowEntry): YMap & SyncedFlowEntry {
        if (data instanceof YMap) return data;
        if (!data) data = {};
        if (!data.startNodeId) data.startNodeId = "";
        if (!data.endNodeId) data.endNodeId = "";
        if (!data.points) data.points = [];
        return YUtilities.createYMap(data);
    }

    public updateAfterMovingNode(nodeId: string, deltaPosition: Point) {
        return this.model.updateHandler.updateAfterMovingNode(nodeId, deltaPosition);
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

    public addPoint(point: Point, isTemporary: boolean = false) {
        return this.model.pointHandler.addPoint(point, isTemporary);
    }

    public removePoint(index: number) {
        return this.model.pointHandler.removePoint(index);
    }

    public incrementPoint(index: number, increment: Coordinate) {
        return this.model.pointHandler.incrementPoint(index, increment);
    }

    public getMaxPoint(): Point {
        return this.model.pointHandler.getMaxPoint();
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

    public delete() {
        this.view.clearDrawing();
        this.model.flow.removeEntry(this);
    }

    public endEntry(endNodeId?: string) {
        if (endNodeId) this.endNodeId = endNodeId;
        if (!this.model.endNodeId) return this.delete();
        console.log(this.model.temporaryPoint)
        if (this.model.temporaryPoint) this.addPoint(this.model.temporaryPoint, false);
    }
}