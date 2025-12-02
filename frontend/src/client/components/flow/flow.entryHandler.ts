import {TurboHandler, YArray, YManagerModel, YMap} from "turbodombuilder";
import {FlowModel} from "./flow.model";
import {SyncedFlowEntry} from "../flowEntry/flowEntry.types";
import {FlowEntry} from "../flowEntry/flowEntry";

export class FlowEntryHandler extends TurboHandler<FlowModel> {
    private entryModel: YManagerModel<
        YArray<SyncedFlowEntry & YMap>,
        YManagerModel<SyncedFlowEntry & YMap, FlowEntry, number, YArray>,
        string,
        YMap
    >;

    public onUpdated: () => void = () => {};
    public onFlowEntryAdded: (data: SyncedFlowEntry) => FlowEntry;

    public constructor(model: FlowModel) {
        super(model);
        this.entryModel = new YManagerModel();
        this.entryModel.onAdded.add(array => {
            const manager = new YManagerModel<SyncedFlowEntry & YMap, FlowEntry, number, YArray>(array);
            manager.onAdded.add(data => this.onFlowEntryAdded?.(data));
            return manager;
        });

        this.entryModel.onUpdated.add(() => this.onUpdated());
    }

    protected getData(): YMap<YArray<SyncedFlowEntry & YMap>> {
        return this.entryModel.data;
    }

    public setData(data: YMap<YArray<SyncedFlowEntry & YMap>>) {
        this.entryModel.data = data;
    }

    public getAllEntries(): FlowEntry[] {
        return this.entryModel.getAllComponents()
            .flatMap(manager => manager.getAllComponents());
    }

    public getAllEntriesData(): (SyncedFlowEntry & YMap)[] {
        const results = [];
        this.entryModel.getAllData().forEach(arr => {
            arr.forEach(entry => results.push(entry));
        });
        return results;
    }

    public getEntriesData(id: string): (YMap & SyncedFlowEntry)[] {
        return this.entryModel.getData(id);
    }

    public getEntries(id: string): FlowEntry[] {
        return this.entryModel.getInstance(id)?.getAllComponents() || [];
    }

    public getEntriesFromNodesList(nodes: string[]): FlowEntry[] {
        const entries: FlowEntry[] = [];
        for (let i = 0; i < nodes.length - 1; i++) {
            entries.push(this.getEntries(nodes[i]).find(entry => entry.endNodeId === nodes[i + 1]));
        }
        return entries;
    }

    public createEntry(data: SyncedFlowEntry): SyncedFlowEntry & YMap {
        if (!data || !data.startNodeId) return null;
        const entry = FlowEntry.createData(data);
        this.addEntry(entry, data.startNodeId);
        return entry;
    }

    public addEntry(entry: FlowEntry | (SyncedFlowEntry & YMap), id?: string) {
        if (entry instanceof FlowEntry) entry = entry.data;
        if (!id) id = entry.get("startNodeId");

        if (!this.entryModel.getData(id)) this.entryModel.setData(id, new YArray());
        this.entryModel.getData(id).push([entry]);
    }

    public removeEntry(entry: FlowEntry) {
        if (!entry) return;
        const arr: YArray<SyncedFlowEntry & YMap> = this.entryModel.getData(entry.startNodeId);
        if (!arr) return;

        arr.forEach((arrEntry, id) => {
            if (arrEntry !== entry.data) return;
            arr.delete(id);
        });
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