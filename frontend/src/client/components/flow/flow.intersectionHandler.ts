import {Point, TurboHandler} from "turbodombuilder";
import {FlowIntersection} from "./flow.types";
import {FlowModel} from "./flow.model";

export class FlowIntersectionHandler extends TurboHandler<FlowModel> {
    public intersectsPoint(p: Point, errorMargin: number = 50, incrementValue: number = 1): boolean {
        for (const entry of this.model.entries) {
            if (entry.intersectsPoint(p, errorMargin, incrementValue)) return true;
        }
        return false;
    }

    public intersectsArea(topLeft: Point, size: Point): boolean {
        for (const entry of this.model.entries) {
            if (entry.intersectsArea(topLeft, size)) return true;
        }
        return false;
    }

    public closestPointOnPath(p: Point, errorMargin: number = 50, incrementValue: number = 10): FlowIntersection {
        let closestPoint: FlowIntersection = null;
        for (const entry of this.model.entries) {
            closestPoint = entry.closestPointOnPath(p, closestPoint, errorMargin, incrementValue);
        }

        return closestPoint;
    }
}