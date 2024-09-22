import {auto, Point} from "turbodombuilder";
import * as d3 from "d3";
import {FlowHandler} from "../flow.handler";
import {Flow} from "../../flow";
import {SyncedFlowBranch} from "../../flow.types";
import {SyncedType} from "../../../../abstract/syncedComponent/syncedComponent.types";

export class FlowDrawingHandler extends FlowHandler {
    private _data: SyncedType<SyncedFlowBranch[]>;

    //Intervals at which chevrons are placed
    private readonly chevronInterval = 300 as const;
    //Shape of the chevron
    private readonly chevronShape = "M 0 -6 L 12 0 L 0 6" as const;
    //Timeout before chevrons are drawn
    private readonly chevronTimeout = 200 as const;
    //Timers to not draw chevrons when performing moving actions
    private chevronTimers: Map<number, NodeJS.Timeout> = new Map<number, NodeJS.Timeout>();

    // Added margin to the computed viewBox
    private readonly viewBoxPadding = 200 as const;
    // Rate at which the viewBox updates
    private readonly viewBoxUpdateRate = 200 as const;
    // Keeps track of the last time the viewBox was updated
    private lastViewBoxUpdate = 0;
    private lastViewBoxValues: Point = new Point();

    constructor(flow: Flow) {
        super(flow);
        //Init fields
        this.temporaryPoint = null;
        this.data = flow.data.flowBranches;
    }

    public get data(): SyncedType<SyncedFlowBranch[]> {
        return this._data;
    }

    private set data(value: SyncedType<SyncedFlowBranch[]>) {
        this.data?.unobserve(this);
        this._data = value;
        if (value && value.observe) value.observe(this);
    }

    /**
     * A temporary point added to the path, representing the cursor's position or the last touch point.
     */
    @auto()
    public set temporaryPoint(value: Point) {
        this.redrawBranch(this.flow.currentBranchIndex);
    }

    /**
     * @description The points of the flow mapped into a single array
     */
    public get points(): Point[] {
        const points = this.flowBranches?.flatMap(branch => [...branch.flowEntries])
            .flatMap(cardWithConnections => [...cardWithConnections.points])
            .map(point => new Point(point));
        if (this.temporaryPoint) points.push(this.temporaryPoint);
        return points;
    }

    /**
     * @description The points of the flow mapped into a single array
     */
    public getPointsInBranch(branchIndex: number): Point[] {
        if (!this.flowBranches || this.flowBranches.length == 0) return [];
        const points = this.flowBranches[branchIndex].flowEntries
            .flatMap(cardWithConnections => [...cardWithConnections.points])
            .map(point => new Point(point));
        if (this.temporaryPoint) points.push(this.temporaryPoint);
        return points;
    }

    public onUpdated(newValue: SyncedFlowBranch, oldValue: SyncedFlowBranch, path: (string | number)[]) {
        if (path.length == 0) return newValue.forward_callbacks(this);
        if (!newValue && !oldValue) return;
        this.redrawBranch(path.find(entry => typeof entry == "number"));
    }

    private redrawBranch(branchIndex: number = this.flow.currentBranchIndex) {
        if (!this.svg) return;
        if (branchIndex >= this.flowBranches.length) return;
        this.updateViewBox(this.points);
        this.drawPath(branchIndex);
    }

    /**
     * @description Updates the viewBox of the SVG to ensure the full path is visible (+ a padding)
     * @param points
     * @private
     */
    private async updateViewBox(points: Point[]) {
        if (!this.points || this.points.length == 0) return;
        // Ensure updates occur at defined rate
        if (Date.now() - this.lastViewBoxUpdate <= this.viewBoxUpdateRate) return;
        this.lastViewBoxUpdate = Date.now();

        // Knowing that (0, 0) is at the center of the canvas, some points have negative coordinates,
        // so I get the max x and y absolute values in all the points to ensure I'm not ignoring negative values
        points.forEach(p => this.lastViewBoxValues = Point.max(this.lastViewBoxValues, p.abs()));

        // Compute the dimensions by doubling the coordinates and adding the padding
        const width = this.lastViewBoxValues.x * 2 + this.viewBoxPadding * 2;
        const height = this.lastViewBoxValues.y * 2 + this.viewBoxPadding * 2;

        // Update SVG width, height, and viewBox
        d3.select(this.svg)
            .attr("width", width)
            .attr("height", height)
            .attr("viewBox", `-${width / 2} -${height / 2} ${width} ${height}`);
    }

    /**
     * @description Draws the points using D3's natural curve option and adds chevrons
     * @private
     * @param branchIndex
     */
    private drawPath(branchIndex: number) {
        if (branchIndex >= this.flowBranches.length) return;
        const points = this.getPointsInBranch(branchIndex);

        let group = this.svgGroups.get(branchIndex);
        if (!group) {
            // Append new group
            group = d3.select(this.svg).append("g").node();
            this.svgGroups.set(branchIndex, group);
        }

        //Clear the flow
        d3.select(group).selectAll("*").remove();

        if (points.length < 2) return;

        const isTemporary = this.flowBranches[branchIndex].overwriting != undefined;

        //Generate the path data
        const lineGenerator = d3.line<Point>()
            .x(d => d.x)
            .y(d => d.y)
            .curve(d3.curveNatural);

        const pathData = lineGenerator(points);


        //Append the path to the group
        const path = d3.select(group).append("path")
            .attr("class", "flow")
            .attr("d", pathData)
            .attr("stroke-dasharray", isTemporary ? "5, 5" : null)
            .attr("opacity", isTemporary ? 0.6 : 1)
            .node() as SVGPathElement;

        clearTimeout(this.chevronTimers.get(branchIndex));
        this.chevronTimers.set(branchIndex, setTimeout(() =>
            this.drawChevrons(group, path, isTemporary), this.chevronTimeout));
    }

    private drawChevrons(group: SVGGElement, path: SVGPathElement, isTemporary: boolean = false) {
        // Add chevrons
        const pathLength = path.getTotalLength();
        for (let distance = this.chevronInterval; distance < pathLength; distance += this.chevronInterval) {
            const point = path.getPointAtLength(distance);
            const nextPoint = path.getPointAtLength(distance + 1);
            //Compute angle
            const angle = Math.atan2(nextPoint.y - point.y, nextPoint.x - point.x) * (180 / Math.PI);
            d3.select(group).append("path")
                .attr("class", "chevron")
                .attr("d", this.chevronShape)
                .attr("transform", `translate(${point.x}, ${point.y}) rotate(${angle})`)
                .attr("fill", isTemporary ? "grey" : "black")
                .attr("stroke-linecap", "round")
                .attr("stroke-linejoin", "round")
                .attr("opacity", isTemporary ? 0.6 : 1);
        }
    }

    public highlightBranches(branchIndices: number[]) {

    }
}
