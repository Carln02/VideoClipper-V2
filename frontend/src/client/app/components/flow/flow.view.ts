import {Point, TurboView} from "turbodombuilder";
import {Flow} from "./flow";
import {FlowModel} from "./flow.model";
import * as d3 from "d3";

export class FlowView extends TurboView<Flow, FlowModel> {
    public svg: SVGSVGElement;
    public svgGroups: Map<number, SVGGElement>;

    public initialize() {
        super.initialize();
        requestAnimationFrame(() => this.updateViewBox());
    }

    protected setupUIElements() {
        super.setupUIElements();

        this.svg = d3.select(this.element).append("svg")
            .attr("namespace", "http://www.w3.org/2000/svg").node();
        this.svgGroups = new Map<number, SVGGElement>();
    }

    protected setupChangedCallbacks() {
        super.setupChangedCallbacks();

        this.emitter.add("__redraw", () => this.updateViewBox());
    }

    /**
     * @description Updates the viewBox of the SVG to ensure the full path is visible (+ a padding)
     * @private
     */
    private async updateViewBox() {
        console.log("HI VIEWOK")
        // Ensure updates occur at defined rate
        if (Date.now() - this.model.lastViewBoxUpdate <= this.model.viewBoxUpdateRate) return;
        this.model.lastViewBoxUpdate = Date.now();

        this.model.branches.forEach(branch => {
            this.model.lastViewBoxValues = Point.max(this.model.lastViewBoxValues, branch.getMaxPoint());
        });

        // Compute the dimensions by doubling the coordinates and adding the padding
        const width = this.model.lastViewBoxValues.x * 2 + this.model.viewBoxPadding * 2;
        const height = this.model.lastViewBoxValues.y * 2 + this.model.viewBoxPadding * 2;

        // Update SVG width, height, and viewBox
        d3.select(this.svg)
            .attr("width", width)
            .attr("height", height)
            .attr("viewBox", `-${width / 2} -${height / 2} ${width} ${height}`);
    }
}