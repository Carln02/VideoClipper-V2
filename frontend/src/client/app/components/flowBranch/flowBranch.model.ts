import {YComponentModel} from "../../../../yManagement/yModel/types/yComponentModel";
import {auto, Coordinate, Point} from "turbodombuilder";
import {YArray, YMap} from "../../../../yManagement/yManagement.types";
import {SyncedFlowEntry} from "../flowEntry/flowEntry.types";
import {FlowBranchEntryHandler} from "./flowBranch.entryHandler";
import {FlowBranchPointHandler} from "./flowBranch.pointHandler";
import {FlowBranchSearchHandler} from "./flowBranch.searchHandler";
import {FlowBranchCleaningHandler} from "./flowBranch.cleaningHandler";
import {FlowBranchUpdateHandler} from "./flowBranch.updateHandler";
import {FlowBranchIntersectionHandler} from "./flowBranch.intersectionHandler";
import {Flow} from "../flow/flow";
import {FlowBranchConnectionHandler} from "./flowBranch.connectionHandler";

export class FlowBranchModel extends YComponentModel {
    public flow: Flow;
    public pathSelection: d3.Selection<SVGPathElement, unknown, null, undefined>;

    public lastNode: string = null;
    public flowId: string;

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
        this.data?.observeDeep(events => {
            for (const event of events) {
                if (event.path.includes("entries")) {
                    this.fireCallback("__redraw");
                    break;
                }
            }
        });
    }

    public get path(): SVGPathElement {
        return this.pathSelection.node() as SVGPathElement;
    }

    public get entries(): YArray<SyncedFlowEntry & YMap> {
        return this.getData("entries");
    }

    public get entriesArray(): (SyncedFlowEntry & YMap)[] {
        return this.entries?.toArray();
    }

    public get connectedBranches(): YArray<string> {
        return this.getData("connectedBranches");
    }

    public get connectedBranchesArray(): string[] {
        return this.connectedBranches.toArray();
    }

    public get isOverwriting(): boolean {
        const overwriting = this.overwriting;
        return overwriting && overwriting.length > 0;
    }

    public get overwriting(): string {
        return this.getData("overwriting");
    }

    public set overwriting(value: string) {
        this.setData("overwriting", value);
    }

    public get points(): Point[] {
        const points = this.entriesArray
            ?.flatMap(cardWithConnections => cardWithConnections.get("points"))
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

    public get entryHandler(): FlowBranchEntryHandler {
        return this.getHandler("entry") as FlowBranchEntryHandler;
    }

    public get pointHandler(): FlowBranchPointHandler {
        return this.getHandler("point") as FlowBranchPointHandler;
    }

    public get searchHandler(): FlowBranchSearchHandler {
        return this.getHandler("search") as FlowBranchSearchHandler;
    }

    public get cleaningHandler(): FlowBranchCleaningHandler {
        return this.getHandler("cleaning") as FlowBranchCleaningHandler;
    }

    public get updateHandler(): FlowBranchUpdateHandler {
        return this.getHandler("update") as FlowBranchUpdateHandler;
    }

    public get intersectionHandler(): FlowBranchIntersectionHandler {
        return this.getHandler("intersection") as FlowBranchIntersectionHandler;
    }

    public get connectionHandler(): FlowBranchConnectionHandler {
        return this.getHandler("connection") as FlowBranchConnectionHandler;
    }
}