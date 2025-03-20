import {SyncedFlowEntry, SyncedFlowEntryData} from "../flowEntry/flowEntry.types";
import {YUtilities} from "../../../../yManagement/yUtilities";
import {Coordinate, TurboHandler} from "turbodombuilder";
import {FlowBranchModel} from "./flowBranch.model";

export class FlowBranchEntryHandler extends TurboHandler<FlowBranchModel> {
    public getEntry(index: number): SyncedFlowEntry {
        const length = this.model.flowEntriesArray.length;
        if (index === undefined || index === null || index < 0) index = 0;
        if (index > length - 1) index = length - 1;
        return this.model.flowEntries.get(index);
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
        if (index === undefined || index === null || index > this.model.flowEntriesArray.length - 1)
            this.model.flowEntries.push([entry]);
        else {
            if (index < 0) index = 0;
            this.model.flowEntries.insert(index, [entry]);
        }
    }

    public addNewEntry(data: SyncedFlowEntryData, index ?: number) {
        this.addEntry(this.createEntry(data), index);
    }

    public removeEntryAt(index ?: number) {
        const length = this.model.flowEntriesArray.length;
        if (index === undefined || index === null || index > length - 1) index = length - 1;
        else if (index < 0) index = 0;
        this.model.flowEntries.delete(index);
    }

    public removeEntry(entry: SyncedFlowEntry) {
        const array = this.model.flowEntriesArray;
        if (!array.includes(entry)) return;
        this.removeEntryAt(array.indexOf(entry));
    }

    public setEntry(entry: SyncedFlowEntry, index ?: number) {
        this.removeEntryAt(index);
        this.addEntry(entry, index);
    }
}