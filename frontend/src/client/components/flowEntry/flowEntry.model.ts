import {YComponentModel} from "../../../yManagement/yModel/types/yComponentModel";
import {auto, Coordinate, Point} from "turbodombuilder";
import {SplitEntryData, SyncedFlowEntry} from "./flowEntry.types";
import {YUtilities} from "../../../yManagement/yUtilities";
import {Flow} from "../flow/flow";
import d3 from "d3";
import {FlowBranchPointHandler} from "../flowBranch/flowBranch.pointHandler";
import {FlowBranchSearchHandler} from "../flowBranch/flowBranch.searchHandler";
import {FlowBranchCleaningHandler} from "../flowBranch/flowBranch.cleaningHandler";
import {FlowBranchUpdateHandler} from "../flowBranch/flowBranch.updateHandler";
import {FlowBranchIntersectionHandler} from "../flowBranch/flowBranch.intersectionHandler";
import {FlowBranchConnectionHandler} from "../flowBranch/flowBranch.connectionHandler";
import {FlowEntryPointHandler} from "./flowEntry.pointHandler";
import {FlowEntryUpdateHandler} from "./flowEntry.updateHandler";
import {FlowEntryIntersectionHandler} from "./flowEntry.intersectionHandler";

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

        YUtilities.deepObserveAny(this.data, () => this.fireCallback("__redraw"), "entries");
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

    public get points(): Point[] {
        const points = this.pointsData
            .filter((point: Coordinate) => !!point)
            .map((point: Coordinate) => new Point(point));
        if (this.temporaryPoint) points.push(this.temporaryPoint);
        return points;
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

    /**
     * Splits an entry at the given point index into before/after + a new "split" entry.
     * Returns [beforeSplitEntry, splitEntry, afterSplitEntry].
     */
    public splitAtPoint(splitPointIndex: number, nodeId: string, splitPoint: Coordinate): SplitEntryData {

        // Create before/after
        const beforeSplit: SyncedFlowEntry = {
            startNodeId: this.startNodeId,
            endNodeId: nodeId,
            points: [...this.points.slice(0, splitPointIndex), splitPoint]
        };

        const afterSplit: SyncedFlowEntry = {
            startNodeId: nodeId,
            endNodeId: this.endNodeId,
            points: [splitPoint, ...this.points.slice(splitPointIndex + 1)]
        };

        // The newly inserted "middle" entry (splitEntry).
        const splitEntry: SyncedFlowEntry = {
            startNodeId: nodeId,
            endNodeId: nodeId,
            points: [splitPoint]
        };

        return {beforeSplit: beforeSplit, splitEntry: splitEntry, afterSplit: afterSplit};
    }

    public get pointHandler(): FlowEntryPointHandler {
        return this.getHandler("point") as FlowEntryPointHandler;
    }

    public get searchHandler(): FlowBranchSearchHandler {
        return this.getHandler("search") as FlowBranchSearchHandler;
    }

    public get cleaningHandler(): FlowBranchCleaningHandler {
        return this.getHandler("cleaning") as FlowBranchCleaningHandler;
    }

    public get updateHandler(): FlowEntryUpdateHandler {
        return this.getHandler("update") as FlowEntryUpdateHandler;
    }

    public get intersectionHandler(): FlowEntryIntersectionHandler {
        return this.getHandler("intersection") as FlowEntryIntersectionHandler;
    }

    public get connectionHandler(): FlowBranchConnectionHandler {
        return this.getHandler("connection") as FlowBranchConnectionHandler;
    }
}