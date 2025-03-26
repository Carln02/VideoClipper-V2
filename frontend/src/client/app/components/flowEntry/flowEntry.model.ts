import {YComponentModel} from "../../../../yManagement/yModel/types/yComponentModel";
import {Coordinate, Point} from "turbodombuilder";

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
}