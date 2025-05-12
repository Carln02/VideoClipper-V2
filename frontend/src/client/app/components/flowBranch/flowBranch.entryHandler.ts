import {SyncedFlowEntry} from "../flowEntry/flowEntry.types";
import {mod, TurboHandler} from "turbodombuilder";
import {FlowBranchModel} from "./flowBranch.model";
import {YArray, YMap } from "../../../../yManagement/yManagement.types";
import {YManagerModel} from "../../../../yManagement/yModel/types/yManagerModel";
import {FlowEntry} from "../flowEntry/flowEntry";

export class FlowBranchEntryHandler extends TurboHandler<FlowBranchModel> {
    private entriesModel: YManagerModel<SyncedFlowEntry & YMap, FlowEntry, number, YArray>;

    public constructor(model: FlowBranchModel) {
        super(model);
        this.entriesModel = new YManagerModel();
        this.entriesModel.onAdded = entry => new FlowEntry(entry);
    }

    public setData(data: YArray<SyncedFlowEntry>, initialize: boolean = false) {
        this.entriesModel.data = data;
    }

    public initializeModel() {
        this.entriesModel.initialize();
    }

    public getEntries(): FlowEntry[] {
        return this.entriesModel.getAllComponents();
    }

    public getEntry(index: number): FlowEntry {
        return this.entriesModel.getInstance(index);
    }

    public createEntry(data: SyncedFlowEntry): SyncedFlowEntry & YMap {
        return FlowEntry.createData(data);
    }

    public addEntry(entry: FlowEntry | (SyncedFlowEntry & YMap), index ?: number) {
        if (entry instanceof FlowEntry) entry = entry.data;
        if (index === undefined || index === null || index > this.model.entriesDataArray.length - 1) {
            this.model.entriesData.push([entry]);
        } else {
            if (index < 0) index = 0;
            this.model.entriesData.insert(index, [entry]);
        }
    }

    public addNewEntry(data: FlowEntry | SyncedFlowEntry, index ?: number) {
        this.addEntry((data instanceof YMap || data instanceof FlowEntry) ? data : this.createEntry(data), index);
    }

    public removeEntryAt(index ?: number) {
        const length = this.model.entriesDataArray.length;
        if (index === undefined || index === null || index > length - 1) index = length - 1;
        else if (index < 0) index = 0;
        this.model.entriesData.delete(index);
    }

    public removeEntry(entry: FlowEntry) {
        const array = this.model.entriesDataArray;
        if (!array.includes(entry.data)) return;
        this.removeEntryAt(array.indexOf(entry.data));
    }

    public setEntry(entry: FlowEntry, index ?: number) {
        this.removeEntryAt(index);
        this.addEntry(entry.data, index);
    }

    public spliceEntries(start: number, deleteCount?: number, ...entries: SyncedFlowEntry[]) {
        if (deleteCount == undefined) deleteCount = this.model.entriesData.length - start;
        for (let i = start + deleteCount - 1; i > start; i--) this.removeEntryAt(i);
        entries?.forEach(entry => this.addNewEntry(entry), start);
    }

    public getNodesIds(): string[] {
        const ids = [];
        const pushIdIfValid = (id: string) => {
            if (id !== undefined && (ids.length <= 0 || ids[ids.length - 1] !== id)) ids.push(id);
        };

        this.model.entriesDataArray.forEach((entry) => {
            pushIdIfValid(entry.get("startNodeId"));
            pushIdIfValid(entry.get("endNodeId"));
        });
        return ids;
    }
}