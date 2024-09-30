import {Point} from "turbodombuilder";
import {FlowPoint} from "../../flow.types";
import {Flow} from "../../flow";
import {FlowHandler} from "../flow.handler";
import * as d3 from "d3";

export class FlowIntersectionHandler extends FlowHandler {
    constructor(flow: Flow) {
        super(flow);
        //Init fields
    }

    /**
     * @description Returns the first flow (for now) that the provided point intersects with, with an error margin
     * @param p
     * @param errorMargin
     */
    public static flowIntersectingWithPoint(p: Point, errorMargin: number = 50): FlowPoint {
        //Loop on all flows
        for (const flow of Flow.getAll()) {
            if (!flow.intersectionHandler.intersectsPoint(p, errorMargin)) continue;
            //If point intersects with flow --> return flow ID
            const points = flow.intersectionHandler.closestPointOnPath(p, errorMargin);
            if (!points) continue;
            return points;
        }
        return null;
    }

    /**
     * @description Returns the first flow (for now) that the provided area intersects with
     * @param topLeft
     * @param size
     */
    public static flowIntersectingWithArea(topLeft: Point, size: Point): Flow {
        //Loop on all flows
        for (const flow of Flow.getAll()) {
            //If point intersects with flow --> return flow ID
            if (flow.intersectionHandler.intersectsArea(topLeft, size)) return flow;
        }
        return null;
    }

    private svgPoint(p: Point) {
        const svgPoint = this.svg.createSVGPoint();

        svgPoint.x = p.x;
        svgPoint.y = p.y;

        return svgPoint;
    }

    public intersectsArea(topLeft: Point, size: Point) {
        for (const group of this.svgGroups.values()) {
            const path = d3.select(group).select("path").node() as SVGPathElement;
            for (let i = 0; i <= size.x; i++) {
                if (path.isPointInStroke(this.svgPoint(topLeft.add(i, 0)))) return true;
                if (path.isPointInStroke(this.svgPoint(topLeft.add(i, size.y)))) return true;
            }

            for (let i = 0; i <= size.y; i++) {
                if (path.isPointInStroke(this.svgPoint(topLeft.add(0, i)))) return true;
                if (path.isPointInStroke(this.svgPoint(topLeft.add(size.x, i)))) return true;
            }
        }
        return false;
    }

    public computePlacedPoints(path: SVGPathElement, incrementationValue: number = 10): DOMPoint[] {
        const placedPoints = [];
        for (let i = 0; i < path.getTotalLength(); i += incrementationValue) {
            placedPoints.push(path.getPointAtLength(i));
        }
        return placedPoints;
    }

    public intersectsPoint(p: Point, errorMargin: number = 50, incrementValue: number = 1) {
        const numPoints = Math.ceil(2 * Math.PI * errorMargin);

        for (const group of this.svgGroups.values()) {
            const path = d3.select(group).select("path").node() as SVGPathElement;
            if (!path) continue;
            for (let i = 0; i < numPoints; i += incrementValue) {
                const angle = (i / numPoints) * 2 * Math.PI;
                const point = p.add(errorMargin * Math.cos(angle), errorMargin * Math.sin(angle));
                if (path.isPointInStroke(this.svgPoint(point))) {
                    return true;
                }
            }
        }
        return false;
    }

    public closestPointOnPath(p: Point, errorMargin: number = 50, incrementValue: number = 10): FlowPoint {
        let closestPlacedPoint: {
            distance: number,
            branchIndex: number,
            previousDefinedPointIndex: number,
            point: DOMPoint
        } = null;

        for (const [index, group] of this.svgGroups) {
            const path = d3.select(group).select("path").node() as SVGPathElement;
            if (!path) continue;

            const definedPoints = this.flow.drawingHandler.getPointsInBranch(index);
            const placedPoints = this.computePlacedPoints(path, incrementValue);

            let nextDefinedPointIndex = 1;

            placedPoints.forEach(point => {
                if (nextDefinedPointIndex < definedPoints.length
                    && Point.dist(definedPoints[nextDefinedPointIndex], point) <= incrementValue)
                    nextDefinedPointIndex++;
                const dist = Point.dist(p, point);
                if (dist >= errorMargin || dist < closestPlacedPoint?.distance) return;
                closestPlacedPoint = {
                    distance: dist,
                    branchIndex: index,
                    previousDefinedPointIndex: nextDefinedPointIndex - 1,
                    point: point
                };
            });
        }

        if (!closestPlacedPoint) return null;
        return this.flow.searchHandler.findPointDataFromIndex(closestPlacedPoint.branchIndex,
            closestPlacedPoint.previousDefinedPointIndex);
    }
}