/**
 * @description Interpolates x linearly between (x1, y1) and (x2, y2). If strict is true, then x will not be allowed
 * to go beyond [x1, x2].
 * @param x
 * @param x1
 * @param x2
 * @param y1
 * @param y2
 * @param strict
 */
export function linearInterpolation(x: number, x1: number, x2: number, y1: number, y2: number, strict: boolean = true) {
    if (strict) {
        const xMax = Math.max(x1, x2);
        const xMin = Math.min(x1, x2);

        if (x > xMax) x = xMax;
        if (x < xMin) x = xMin;
    }

    return y1 + ((x - x1) * (y2 - y1)) / (x2 - x1);
}