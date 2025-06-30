import {YArray, YMap} from "../../../yManagement/yManagement.types";
import {YComponentModel} from "../../../yManagement/yModel/types/yComponentModel";
import {SyncedFlow} from "./flow.types";
import {SyncedFlowTag} from "../flowTag/flowTag.types";
import {Point} from "turbodombuilder";
import {FlowIntersectionHandler} from "./flow.intersectionHandler";
import {FlowTagsModel} from "./flow.tagsModel";
import {FlowTag} from "../flowTag/flowTag";
import {YUtilities} from "../../../yManagement/yUtilities";
import {FlowEntryHandler} from "./flow.entryHandler";
import {SyncedFlowEntry} from "../flowEntry/flowEntry.types";
import {FlowEntry} from "../flowEntry/flowEntry";
import {FlowUpdateHandler} from "./flow.updateHandler";

export class FlowModel extends YComponentModel {
    public currentEntryId: string;

    public readonly tagsModel: FlowTagsModel;

    // Added margin to the computed viewBox
    public readonly viewBoxPadding = 200 as const;
    // Rate at which the viewBox updates
    public readonly viewBoxUpdateRate = 200 as const;
    // Keeps track of the last time the viewBox was updated
    public lastViewBoxUpdate = 0;
    public lastViewBoxValues: Point = new Point();

    public onFlowEntryAdded: (data: SyncedFlowEntry) => FlowEntry;
    public onFlowTagAdded: (data: SyncedFlowTag) => FlowTag;

    public constructor(data: SyncedFlow) {
        super(data as any);
        this.tagsModel = new FlowTagsModel();
    }

    public get data(): any {
        return super.data;
    }

    public set data(value: any) {
        super.data = value;

        this.entryHandler.setData(this.getData("entries"));
        this.entryHandler.onFlowEntryAdded = (data) => this.onFlowEntryAdded(data);

        this.tagsModel.data = this.tagsData;
        // this.tagsModel.onAdded = (data) => this.onFlowTagAdded(data);

        YUtilities.deepObserveAll(this.data, () => this.fireCallback("__redraw"), "branches", "entries");
    }

    public get currentEntry(): FlowEntry {
        const entries = this.entryHandler.getEntries(this.currentEntryId);
        return entries?.[entries?.length - 1];
    }

    public get entryHandler(): FlowEntryHandler {
        return this.getHandler("entry") as FlowEntryHandler;
    }

    public get intersectionHandler(): FlowIntersectionHandler {
        return this.getHandler("intersection") as FlowIntersectionHandler;
    }

    public get updateHandler(): FlowUpdateHandler {
        return this.getHandler("update") as FlowUpdateHandler;
    }

    public get entriesData(): YMap<YArray<SyncedFlowEntry & YMap>> {
        return this.getData("entries") as YMap<YArray<SyncedFlowEntry & YMap>>;
    }

    public get entriesDataArray(): (SyncedFlowEntry & YMap)[] {
        return this.entryHandler.getAllEntriesData();
    }

    public get tagsData(): YArray<SyncedFlowTag> {
        return this.getData("tags");
    }

    public get tagsDataArray(): SyncedFlowTag[] {
        return this.tagsData.toArray();
    }

    public get defaultName(): string {
        return this.getData("defaultName");
    }

    public get color(): string {
        return this.getData("color");
    }

    public set color(value: string) {
        this.setData("color", value);
    }

    public get entries(): FlowEntry[] {
        return this.entryHandler.getAllEntries();
    }

    public get tags(): FlowTag[] {
        return this.tagsModel.getAllComponents();
    }
}