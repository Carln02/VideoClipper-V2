import {TurboView} from "turbodombuilder";
import {Flow} from "./flow";
import {FlowModel} from "./flow.model";
import * as d3 from "d3";

export class FlowView extends TurboView<Flow, FlowModel> {
    public svg: SVGSVGElement;
    public svgGroups: Map<number, SVGGElement>;

    protected setupUIElements() {
        super.setupUIElements();

        this.svg = d3.select(this.element).append("svg")
            .attr("namespace", "http://www.w3.org/2000/svg").node();
        this.svgGroups = new Map<number, SVGGElement>();
    }
}