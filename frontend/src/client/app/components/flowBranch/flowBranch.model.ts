import {YComponentModel} from "../../../../yManagement/yModel/types/yComponentModel";
import {auto, Coordinate, Point} from "turbodombuilder";
import {SyncedFlowEntry} from "../flow/flow.types";
import {YArray, YArrayEvent} from "../../../../yManagement/yManagement.types";
import {YUtilities} from "../../../../yManagement/yUtilities";
import {FlowEntryModel} from "../flowEntry/flowEntry.model";
import {SyncedFlowEntryData} from "../flowEntry/flowEntry.types";
import {YMapEvent} from "../../../../yProxy/yProxy/types/base.types";

export class FlowBranchModel extends YComponentModel {
    public lastNode: string = null;

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

            if (relevantChanges) this.fireKeyChangedCallback("__redraw");
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
        this.fireKeyChangedCallback("_temporaryPoint");
    }

    /**
     * @description Adds the provided point to the flow with the given ID. The node ID indicates the ID of the node
     * the point is in (or null), and isTemporary indicates whether the point is temporarily added to the flow as
     * part of user feedback (to not add it to the synced data).
     * @param p
     * @param nodeId
     * @param isTemporary
     */
    public addPoint(p: Point, nodeId ?: string, isTemporary: boolean = false) {
        if (!p) return;

        //If isTemporary --> set temporary point and return
        if (isTemporary) {
            this.temporaryPoint = p;
            return;
        }

        //Clear temporary point and update flow's lastNode
        this.temporaryPoint = null;
        this.lastNode = nodeId;

        //Get data and flow entries (for ease of use)
        const flowEntries = this.flowEntriesArray;

        //Create an entry if none exist
        if (flowEntries.length == 0) {
            if (!nodeId) return;
            this.addNewEntry({startNodeId: nodeId, endNodeId: nodeId});
        }

        //Get last entry
        const currentEntry = new FlowEntryModel(flowEntries[flowEntries.length - 1]);

        //Now adding the point...

        //Point inside of same last node --> just add it
        if (currentEntry.startNodeId == nodeId && currentEntry.endNodeId == nodeId) currentEntry.addPoint(p);

        //Otherwise, if point in a new node --> add a flow entry starting and ending at that node, as well as the point
        else if (nodeId) {
            if (!currentEntry.endNodeId) currentEntry.endNodeId = nodeId;
            this.addNewEntry({startNodeId: nodeId, endNodeId: nodeId, points: [p.object]});
        }
        //Otherwise (point outside a node)
        else {
            //Last entry doesn't have an end node --> entry connects two nodes (the second is still unknown) --> just
            //add the point as part of the entry
            if (!currentEntry.endNodeId) currentEntry.addPoint(p);
                //Otherwise --> create a new entry that connects the last node and a future unknown node, and add to
            //it the point
            else this.addNewEntry({startNodeId: currentEntry.endNodeId, points: [p.object]});
        }
    }

    public getEntry(index: number): SyncedFlowEntry {
        const length = this.flowEntriesArray.length;
        if (index === undefined || index === null || index < 0) index = 0;
        if (index > length - 1) index = length - 1;
        return this.flowEntries.get(index);
    }

    public createEntry(data: SyncedFlowEntryData):
        SyncedFlowEntry {
        const yPoints = YUtilities.createYArray<Coordinate>(data.points || []);
        return YUtilities.createYMap<SyncedFlowEntry>({
            startNodeId: data.startNodeId,
            endNodeId: data.endNodeId,
            points: yPoints
        } as SyncedFlowEntry);
    }

    public addEntry(entry: SyncedFlowEntry, index ?: number) {
        if (index === undefined || index === null || index > this.flowEntriesArray.length - 1) this.flowEntries.push([entry]);
        else {
            if (index < 0) index = 0;
            this.flowEntries.insert(index, [entry]);
        }
    }

    public addNewEntry(data: SyncedFlowEntryData, index ?: number) {
        this.addEntry(this.createEntry(data), index);
    }

    public removeEntryAt(index ?: number) {
        const length = this.flowEntriesArray.length;
        if (index === undefined || index === null || index > length - 1) index = length - 1;
        else if (index < 0) index = 0;
        this.flowEntries.delete(index);
    }

    public removeEntry(entry: SyncedFlowEntry) {
        const array = this.flowEntriesArray;
        if (!array.includes(entry)) return;
        this.removeEntryAt(array.indexOf(entry));
    }

    public setEntry(entry: SyncedFlowEntry, index ?: number) {
        this.removeEntryAt(index);
        this.addEntry(entry, index);
    }
}