import {Point, TurboHandler} from "turbodombuilder";
import {FlowIntersection} from "./flow.types";
import {FlowModel} from "./flow.model";

export class FlowIntersectionHandler extends TurboHandler<FlowModel> {
    public intersectsPoint(p: Point, errorMargin: number = 50, incrementValue: number = 1): boolean {
        for (const branch of this.model.branches) {
            if (branch.intersectsPoint(p, errorMargin, incrementValue)) return true;
        }
        return false;
    }

    public intersectsArea(topLeft: Point, size: Point): boolean {
        for (const branch of this.model.branches) {
            if (branch.intersectsArea(topLeft, size)) return true;
        }
        return false;
    }

    public closestPointOnPath(p: Point, errorMargin: number = 50, incrementValue: number = 10): FlowIntersection {
        let closestPoint: FlowIntersection = null;
        for (const branch of this.model.branches) {
            closestPoint = branch.closestPointOnPath(p, closestPoint, errorMargin, incrementValue);
        }

        return closestPoint;
    }
}