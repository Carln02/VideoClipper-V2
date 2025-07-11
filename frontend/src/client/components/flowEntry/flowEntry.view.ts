import {Point, TurboView} from "turbodombuilder";
import {FlowEntry} from "./flowEntry";
import * as d3 from "d3";
import {FlowEntryModel} from "./flowEntry.model";

export class FlowEntryView extends TurboView<FlowEntry, FlowEntryModel> {
    public initialize() {
        super.initialize();
        this.model.groupSelection = d3.select(this.element.element);
        this.model.pathSelection = this.model.groupSelection.append("path");
        this.redraw();
    }

    public setupChangedCallbacks(): void {
        super.setupChangedCallbacks();
        this.emitter.add("temporaryPoint", () => this.redraw(true));
        this.emitter.add("__redraw", () => this.redraw(true));
    }

    public redraw(force: boolean = false) {
        if (!force && this.model.lastRedraw && Date.now() - this.model.lastRedraw < this.model.redrawInterval) return;
        this.model.lastRedraw = Date.now();
        this.drawPath();
        //TODO TRIGGER RECOMPUTING OF BOUNDING BOX
    }

    public clearDrawing(): void {
        clearTimeout(this.model.chevronTimer);
        d3.select(this.element.element).selectAll("*").remove();
    }

    protected clearChevrons(): void {
        d3.select(this.element.element).selectAll(".chevron").remove();
    }

    /**
     * @description Draws the points using D3's natural curve option and adds chevrons
     * @private
     */
    private drawPath() {
        const points = this.element.points;
        this.clearChevrons();

        if (points.length < 2) return;
        // const isOverwriting = this.model.isOverwriting;

        //Generate the path data
        const lineGenerator = d3.line<Point>()
            .x(d => d.x)
            .y(d => d.y)
            .curve(d3.curveNatural);

        const pathData = lineGenerator(points.filter(p => !isNaN(p.x) && !isNaN(p.y)));

        //Append the path to the group
        this.model.pathSelection
            .attr("class", "flow")
            .attr("d", pathData)
            // .attr("stroke-dasharray", isOverwriting ? "5, 5" : null)
            .attr("opacity", 1)
            .attr("stroke", this.model.flow.color ?? "black")
            .attr("stroke-width", this.model.strokeWidth);

        this.drawChevronsDelayed();
    }

    private drawChevronsDelayed(delay: number = this.model.chevronTimeout) {
        clearTimeout(this.model.chevronTimer);
        this.model.chevronTimer = setTimeout(() => this.drawChevrons(), delay);
    }

    private drawChevrons() {
        const pathLength = this.model.path.getTotalLength();

        const point = this.model.path.getPointAtLength(pathLength / 2);
        const nextPoint = this.model.path.getPointAtLength(pathLength / 2 + 1);
        //Compute angle
        const angle = Math.atan2(nextPoint.y - point.y, nextPoint.x - point.x) * (180 / Math.PI);

        this.model.groupSelection.append("path")
            .attr("class", "chevron")
            .attr("d", this.model.chevronShape)
            .attr("transform", `translate(${point.x}, ${point.y}) rotate(${angle})`)
            .attr("stroke", this.model.flow.color ?? "black")
            .attr("stroke-linecap", "round")
            .attr("stroke-linejoin", "round")
            .attr("opacity", 1)
            .attr("stroke-width", this.model.strokeWidth);
    }
}