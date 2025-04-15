import {SyncedFlowEntry} from "../flowEntry/flowEntry.types";
import {YUtilities} from "../../../../yManagement/yUtilities";
import {TurboHandler} from "turbodombuilder";
import {FlowBranchModel} from "./flowBranch.model";
import { YMap } from "../../../../yManagement/yManagement.types";

export class FlowBranchEntryHandler extends TurboHandler<FlowBranchModel> {
    public getEntry(index: number): SyncedFlowEntry & YMap {
        const length = this.model.entriesArray.length;
        if (index === undefined || index === null || index < 0) index = 0;
        if (index > length - 1) index = length - 1;
        return this.model.entries.get(index);
    }

    public createEntry(data: SyncedFlowEntry): SyncedFlowEntry & YMap {
        return YUtilities.createYMap<SyncedFlowEntry>({
            startNodeId: data.startNodeId,
            endNodeId: data.endNodeId,
            points: data.points || []
        } as SyncedFlowEntry);
    }

    public addEntry(entry: SyncedFlowEntry & YMap, index ?: number) {
        if (index === undefined || index === null || index > this.model.entriesArray.length - 1)
            this.model.entries.push([entry]);
        else {
            if (index < 0) index = 0;
            this.model.entries.insert(index, [entry]);
        }
    }

    public addNewEntry(data: SyncedFlowEntry, index ?: number) {
        this.addEntry(data instanceof YMap ? data : this.createEntry(data), index);
    }

    public removeEntryAt(index ?: number) {
        const length = this.model.entriesArray.length;
        if (index === undefined || index === null || index > length - 1) index = length - 1;
        else if (index < 0) index = 0;
        this.model.entries.delete(index);
    }

    public removeEntry(entry: SyncedFlowEntry & YMap) {
        const array = this.model.entriesArray;
        if (!array.includes(entry)) return;
        this.removeEntryAt(array.indexOf(entry));
    }

    public setEntry(entry: SyncedFlowEntry & YMap, index ?: number) {
        this.removeEntryAt(index);
        this.addEntry(entry, index);
    }

    public spliceEntries(start: number, deleteCount?: number, ...entries: SyncedFlowEntry[]) {
        if (deleteCount == undefined) deleteCount = this.model.entries.length - start;
        for (let i = start + deleteCount - 1; i > start; i--) this.removeEntryAt(i);
        entries?.forEach(entry => this.addNewEntry(entry), start);
    }
}