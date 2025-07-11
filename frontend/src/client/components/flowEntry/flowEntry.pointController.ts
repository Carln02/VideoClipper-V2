import {Coordinate, Point, TurboController} from "turbodombuilder";
import {FlowEntryModel} from "./flowEntry.model";
import {FlowEntry} from "./flowEntry";
import {FlowEntryView} from "./flowEntry.view";
import {SplitEntryData, SyncedFlowEntry} from "./flowEntry.types";

export class FlowEntryPointController extends TurboController<FlowEntry, FlowEntryView, FlowEntryModel> {
    public get points(): Point[] {
        const points = this.coordinates.map(coordinate => new Point(coordinate));
        return this.element.director.currentScreen?.constrainFlowEntryPoints(this.element, points) ?? points;
    }

    public get coordinates(): Coordinate[] {
        const points = this.model.pointsData
            .filter((point: Coordinate) => !!point);
        if (this.model.temporaryPoint) points.push(this.model.temporaryPoint.object);
        return points;
    }

    /**
     * @description Adds the provided point to the flow with the given ID. The node ID indicates the ID of the node
     * the point is in (or null), and isTemporary indicates whether the point is temporarily added to the flow as
     * part of user feedback (to not add it to the synced data).
     * @param p
     * @param isTemporary
     */
    public addPoint(p: Point, isTemporary: boolean = false) {
        if (!p) return;

        //If isTemporary --> set temporary point and return
        if (isTemporary) {
            this.model.temporaryPoint = p;
            return;
        }

        //Clear temporary point
        this.model.temporaryPoint = null;

        let point: Coordinate = p;
        if (point instanceof Point) point = point.object;
        this.model.setData("points", [...this.model.pointsData, point]);
    }

    public removePoint(index: number) {
        const points = this.points;
        points.splice(index, 1);
        this.model.setData("points", points);
    }

    public incrementPoint(index: number, increment: Coordinate) {
        const points = this.coordinates;
        points[index] = new Point(points[index]).add(increment).object;
        this.model.setData("points", points);
    }

    public getMaxPoint(): Point {
        let maxPoint = new Point();

        const points = this.points;
        if (!points || points.length == 0) return maxPoint;

        // Knowing that (0, 0) is at the center of the canvas, some points have negative coordinates,
        // so I get the max x and y absolute values in all the points to ensure I'm not ignoring negative values
        points.forEach(p => {
            if (!p || p.x == undefined || p.y == undefined) return;
            const max = Point.max(maxPoint, p.abs());
            if (isNaN(max.x) || isNaN(max.y)) return;
            maxPoint = max;
        });
        return maxPoint;
    }

    /**
     * Splits an entry at the given point index into before/after + a new "split" entry.
     * Returns [beforeSplitEntry, splitEntry, afterSplitEntry].
     */
    public splitAtPoint(splitPointIndex: number, nodeId: string, splitPoint: Coordinate): SplitEntryData {

        // Create before/after
        const beforeSplit: SyncedFlowEntry = {
            startNodeId: this.model.startNodeId,
            endNodeId: nodeId,
            points: [...this.coordinates.slice(0, splitPointIndex), splitPoint]
        };

        const afterSplit: SyncedFlowEntry = {
            startNodeId: nodeId,
            endNodeId: this.model.endNodeId,
            points: [splitPoint, ...this.coordinates.slice(splitPointIndex + 1)]
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