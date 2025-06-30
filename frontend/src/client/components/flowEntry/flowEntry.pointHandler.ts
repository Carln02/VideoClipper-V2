import {Coordinate, Point, TurboHandler} from "turbodombuilder";
import {FlowEntryModel} from "./flowEntry.model";

export class FlowEntryPointHandler extends TurboHandler<FlowEntryModel> {
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
        const points = this.model.points;
        points.splice(index, 1);
        this.model.setData("points", points);
    }

    public incrementPoint(index: number, increment: Coordinate) {
        const points = this.model.points;
        this.model.setData("points", points[index].add(increment));
    }

    public getMaxPoint(): Point {
        let maxPoint = new Point();

        const points = this.model.points;
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
}