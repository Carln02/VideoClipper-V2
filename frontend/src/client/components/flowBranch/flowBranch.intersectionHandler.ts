import {Point, TurboHandler} from "turbodombuilder";
import {FlowBranchModel} from "./flowBranch.model";
import {FlowIntersection} from "../flow/flow.types";

export class FlowBranchIntersectionHandler extends TurboHandler<FlowBranchModel> {
    public intersectsPoint(p: Point, errorMargin: number = 50, incrementValue: number = 1): boolean {
        const numPoints = Math.ceil(2 * Math.PI * errorMargin);
        for (let i = 0; i < numPoints; i += incrementValue) {
            const angle = (i / numPoints) * 2 * Math.PI;
            const point = p.add(errorMargin * Math.cos(angle), errorMargin * Math.sin(angle));
            if (this.model.path.isPointInStroke(this.toSvgPoint(point))) return true;
        }
        return false;
    }

    public intersectsArea(topLeft: Point, size: Point): boolean {
        for (let i = 0; i <= size.x; i++) {
            if (this.model.path.isPointInStroke(this.toSvgPoint(topLeft.add(i, 0)))) return true;
            if (this.model.path.isPointInStroke(this.toSvgPoint(topLeft.add(i, size.y)))) return true;
        }

        for (let i = 0; i <= size.y; i++) {
            if (this.model.path.isPointInStroke(this.toSvgPoint(topLeft.add(0, i)))) return true;
            if (this.model.path.isPointInStroke(this.toSvgPoint(topLeft.add(size.x, i)))) return true;
        }
        return false;
    }

    public closestPointOnPath(p: Point, closestPoint: FlowIntersection, errorMargin: number = 50,
                              incrementValue: number = 10): FlowIntersection {
        const definedPoints = this.model.points;
        const placedPoints = this.computePlacedPoints(this.model.path, incrementValue);
        let nextDefinedPointIndex = 1;

        placedPoints.forEach(point => {
            if (nextDefinedPointIndex < definedPoints.length
                && Point.dist(definedPoints[nextDefinedPointIndex], point) <= incrementValue)
                nextDefinedPointIndex++;
            const dist = Point.dist(p, point);
            if (dist >= errorMargin) return;
            if (!closestPoint || dist < closestPoint.distance) {
                closestPoint = {
                    distance: dist,
                    branchId: this.model.dataId,
                    previousDefinedPointIndex: nextDefinedPointIndex - 1,
                    point: point
                };
            }
        });

        return closestPoint;
    }

    private toSvgPoint(p: Point) {
        const svgPoint = this.model.flow.svg.createSVGPoint();
        svgPoint.x = p.x;
        svgPoint.y = p.y;
        return svgPoint;
    }

    private computePlacedPoints(path: SVGPathElement, incrementationValue: number = 10): DOMPoint[] {
        const placedPoints = [];
        for (let i = 0; i <= path.getTotalLength(); i += incrementationValue) {
            placedPoints.push(path.getPointAtLength(i));
        }
        return placedPoints;
    }
}