import {YComponentModel} from "../../../../yManagement/yModel/types/yComponentModel";
import {auto, Coordinate, Point} from "turbodombuilder";
import {YArray, YArrayEvent, YMapEvent} from "../../../../yManagement/yManagement.types";
import {SyncedFlowEntry} from "../flowEntry/flowEntry.types";
import {FlowBranchEntryHandler} from "./flowBranch.entryHandler";
import {FlowBranchPointHandler} from "./flowBranch.pointHandler";

export class FlowBranchModel extends YComponentModel {
    public lastNode: string = null;

    public flowId: string;

    public get data(): any {
        return super.data;
    }

    public set data(value: any) {
        super.data = value;
        this.data?.observeDeep(events => {
            let relevantChanges = false;
            for (const event of events) {
                if ((event instanceof YMapEvent && event.changes.keys.has("entries"))
                    || (event instanceof YArrayEvent && event.target === this.data?.get("entries"))) {
                    relevantChanges = true;
                    break;
                }
            }

            if (relevantChanges) this.fireCallback("__redraw");
        });
    }

    public get flowEntries(): YArray<SyncedFlowEntry> {
        return this.getData("flowEntries");
    }

    public get flowEntriesArray(): SyncedFlowEntry[] {
        return this.flowEntries.toArray();
    }

    public get connectedBranches(): YArray<string> {
        return this.getData("connectedBranches");
    }

    public get connectedBranchesArray(): string[] {
        return this.connectedBranches.toArray();
    }

    public get overwriting(): boolean {
        return this.getData("overwriting");
    }

    public set overwriting(value: boolean) {
        this.setData("overwriting", value);
    }

    public get points(): Point[] {
        const points = this.flowEntriesArray
            ?.flatMap(cardWithConnections => cardWithConnections.get("points").toArray())
            .filter((point: Coordinate) => !!point)
        if (this.temporaryPoint) points.push(this.temporaryPoint);
        return points;
    }

    /**
     * A temporary point added to the path, representing the cursor's position or the last touch point.
     */
    @auto()
    public set temporaryPoint(point: Point) {
        this.fireCallback("_temporaryPoint");
    }

    public get entryHandler(): FlowBranchEntryHandler {
        return this.getHandler("entry") as FlowBranchEntryHandler;
    }

    public get pointHandler(): FlowBranchPointHandler {
        return this.getHandler("point") as FlowBranchPointHandler;
    }
}