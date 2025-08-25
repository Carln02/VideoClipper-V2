import {Coordinate, Point, Side, trim} from "turbodombuilder";

export function getAxisFromSide(side: Side): "x" | "y" {
    if (side === Side.top || side === Side.bottom) return "y";
    if (side === Side.left || side === Side.right) return "x";
}

export function getClosestPointOnEdge(pointer: Coordinate, rect: DOMRect): Point {

    const closestPoint = {
        x:  trim(pointer.x, rect.right, rect.left),
        y: trim(pointer.y, rect.bottom, rect.top)
    };

    let closestSide = Side.top;
    Object.values(Side).forEach(side => {
        if (Math.abs(closestPoint[getAxisFromSide(side)] - rect[side])
            < Math.abs(closestPoint[getAxisFromSide(closestSide)] - rect[closestSide])) closestSide = side;
    });

    closestPoint[getAxisFromSide(closestSide)] = rect[closestSide];
    return new Point(closestPoint);
}

export function pointInsideRect(point: Coordinate, rect: DOMRect, margin: number = 5): boolean {
    return (point.x < rect.right + margin && point.x > rect.left - margin)
        && (point.y < rect.bottom + margin && point.y > rect.top - margin);
}

export function getClippedBoundingRect(el: Element): DOMRect {
    const rect = el.getBoundingClientRect();

    const style = getComputedStyle(el);

    // Calculate the border sizes
    const borderLeft = parseFloat(style.borderLeftWidth) || 0;
    const borderTop = parseFloat(style.borderTopWidth) || 0;

    // Use clientWidth/clientHeight to get content + padding (excludes overflow)
    const width = el.clientWidth;
    const height = el.clientHeight;

    return {
        left: rect.left + borderLeft,
        top: rect.top + borderTop,
        right: rect.left + borderLeft + width,
        bottom: rect.top + borderTop + height,
        width: width,
        height: height,
        x: rect.top + borderTop,
        y: rect.left + borderLeft,
        toJSON: function () {
            throw new Error("Function not implemented.");
        }
    };
}