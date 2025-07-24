import {YComponentModel} from "../../../yManagement/yModel/types/yComponentModel";
import {auto, Coordinate, Point} from "turbodombuilder";
import {YUtilities} from "../../../yManagement/yUtilities";
import {Flow} from "../flow/flow";
import d3 from "d3";

export class FlowEntryModel extends YComponentModel {
    public flow: Flow;

    public groupSelection: d3.Selection<SVGGElement, unknown, null, undefined>;
    public pathSelection: d3.Selection<SVGPathElement, unknown, null, undefined>;

    public readonly defaultStrokeWidth: number = 1 as const;
    public readonly highlightedStrokeWidth: number = 3 as const;

    public readonly redrawInterval: number = 100 as const;
    public readonly chevronInterval = 300 as const;
    public readonly chevronTimeout = 200 as const;
    public readonly chevronShape = "M 0 -6 L 12 0 L 0 6" as const;

    public lastRedraw: number;
    public chevronTimer: NodeJS.Timeout;

    public get data(): any {
        return super.data;
    }

    public set data(value: any) {
        super.data = value;

        YUtilities.deepObserveAny(this.data, () => this.fireCallback("__redraw"), "points");
    }

    public get path(): SVGPathElement {
        return this.pathSelection.node() as SVGPathElement;
    }

    @auto()
    public set highlighted(value: boolean) {
        this.fireCallback("__redraw")
    }

    public get startNodeId(): string {
        return this.getData("startNodeId");
    }

    public set startNodeId(value: string) {
        this.setData("startNodeId", value);
    }

    public get endNodeId(): string {
        return this.getData("endNodeId");
    }

    public set endNodeId(value: string) {
        this.setData("endNodeId", value);
    }

    public get pointsData(): Coordinate[] {
        return this.getData("points");
    }

    /**
     * A temporary point added to the path, representing the cursor's position or the last touch point.
     */
    @auto()
    public set temporaryPoint(point: Point) {
        this.fireCallback("temporaryPoint");
    }

    public get strokeWidth(): number {
        return this.highlighted ? this.highlightedStrokeWidth : this.defaultStrokeWidth;
    }
}