import {YComponentModel} from "../../../yManagement/yModel/types/yComponentModel";
import {Coordinate, Point} from "turbodombuilder";
import {SplitEntryData, SyncedFlowEntry} from "./flowEntry.types";

export class FlowEntryModel extends YComponentModel {
    public get startNodeId(): string {
        return this.getData("startNodeId");
    }

    public set startNodeId(value: string) {
        this.setData("startNodeId", value);
    }

    public get endNodeId(): string {
        return this.getData("endNodeId");
    }

    public set endNodeId(value: string) {
        this.setData("endNodeId", value);
    }

    public get points(): Coordinate[] {
        return this.getData("points");
    }

    public addPoint(point: Coordinate) {
        if (point instanceof Point) point = point.object;
        const points = this.points;
        points.push(point);
        this.setData("points", points);
    }

    public removePoint(index: number) {
        const points = this.points;
        points.splice(index, 1);
        this.setData("points", points);
    }

    public incrementPoint(index: number, increment: Coordinate) {
        const points = this.points;
        points[index].x += increment.x;
        points[index].y += increment.y;
        this.setData("points", points);
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