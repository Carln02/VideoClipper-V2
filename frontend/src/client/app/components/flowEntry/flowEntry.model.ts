import {YComponentModel} from "../../../../yManagement/yModel/types/yComponentModel";
import {YArray} from "yjs/dist/src/types/YArray";
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

    public get points(): YArray<Coordinate> {
        return this.getData("points");
    }

    public get pointsArray(): Coordinate[] {
        return this.points.toArray();
    }

    public addPoint(point: Coordinate) {
        if (point instanceof Point) point = point.object;
        this.points.push([point]);
    }

    public removePoint(index: number) {
        this.points.delete(index);
    }
}