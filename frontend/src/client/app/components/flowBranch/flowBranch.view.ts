import {Point, TurboView} from "turbodombuilder";
import {FlowBranchModel} from "./flowBranch.model";
import * as d3 from "d3";
import {FlowBranch} from "./flowBranch";

export class FlowBranchView extends TurboView<FlowBranch, FlowBranchModel> {
    private readonly redrawInterval: number = 100 as const;
    private readonly chevronInterval = 300 as const;
    private readonly chevronTimeout = 200 as const;
    private readonly chevronShape = "M 0 -6 L 12 0 L 0 6" as const;

    private path: SVGPathElement;

    private lastRedraw: number;
    private chevronTimer: NodeJS.Timeout;

    protected setupUILayout() {
        super.setupUILayout();
    }

    public setupChangedCallbacks(): void {
        super.setupChangedCallbacks();
        this.setChangedCallback("temporaryPoint", () => this.redraw());
        this.setChangedCallback("__redraw", () => this.redraw());
    }

    public redraw(force: boolean = false) {
        if (!force && this.lastRedraw && Date.now() - this.lastRedraw < this.redrawInterval) return;
        this.lastRedraw = Date.now();
        this.drawPath();
        //TODO TRIGGER RECOMPUTING OF BOUNDING BOX
    }

    public clear(): void {
        d3.select(this.element.element).selectAll("*").remove();
    }

    /**
     * @description Draws the points using D3's natural curve option and adds chevrons
     * @private
     */
    private drawPath() {
        const points = this.model.points;
        const group = this.element.element;

        this.clear();

        if (points.length < 2) return;
        const isTemporary = this.model.overwriting != undefined;

        //Generate the path data
        const lineGenerator = d3.line<Point>()
            .x(d => d.x)
            .y(d => d.y)
            .curve(d3.curveNatural);

        const pathData = lineGenerator(points);

        //Append the path to the group
        this.path = d3.select(group).append("path")
            .attr("class", "flow")
            .attr("d", pathData)
            .attr("stroke-dasharray", isTemporary ? "5, 5" : null)
            .attr("opacity", isTemporary ? 0.6 : 1)
            .node() as SVGPathElement;

        this.drawChevronsDelayed();
    }

    private drawChevronsDelayed(delay: number = this.chevronTimeout) {
        clearTimeout(this.chevronTimer);
        this.chevronTimer = setTimeout(() => this.drawChevrons(), delay);
    }

    private drawChevrons() {
        const isTemporary = this.model.overwriting != undefined;
        const pathLength = this.path.getTotalLength();

        for (let distance = this.chevronInterval; distance < pathLength; distance += this.chevronInterval) {
            const point = this.path.getPointAtLength(distance);
            const nextPoint = this.path.getPointAtLength(distance + 1);
            //Compute angle
            const angle = Math.atan2(nextPoint.y - point.y, nextPoint.x - point.x) * (180 / Math.PI);
            d3.select(this.element.element).append("path")
                .attr("class", "chevron")
                .attr("d", this.chevronShape)
                .attr("transform", `translate(${point.x}, ${point.y}) rotate(${angle})`)
                .attr("fill", isTemporary ? "grey" : "black")
                .attr("stroke-linecap", "round")
                .attr("stroke-linejoin", "round")
                .attr("opacity", isTemporary ? 0.6 : 1);
        }
    }
}