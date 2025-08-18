import {define, Point} from "turbodombuilder";
import "./flow.css";
import {SyncedFlow} from "./flow.types";
import {FlowView} from "./flow.view";
import {FlowModel} from "./flow.model";
import {VcComponent} from "../component/component";
import {VcComponentProperties} from "../component/component.types";
import {Project} from "../../directors/project/project";
import {FlowIntersectionHandler} from "./flow.intersectionHandler";
import {YMap} from "../../../yManagement/yManagement.types";
import {YUtilities} from "../../../yManagement/yUtilities";
import {FlowSelector} from "../flowSelector/flowSelector";
import {FlowEntry} from "../flowEntry/flowEntry";
import {SyncedFlowEntry} from "../flowEntry/flowEntry.types";
import {FlowEntryHandler} from "./flow.entryHandler";
import {FlowUpdateHandler} from "./flow.updateHandler";

/**
 * @description A reactiveComponent that represents a flow connecting cards
 */
@define("vc-flow")
export class Flow extends VcComponent<FlowView, SyncedFlow, FlowModel, Project> {
    public constructor(properties: VcComponentProperties<FlowView, SyncedFlow, FlowModel, Project> = {}) {
        super(properties);
        this.mvc.generate({
            viewConstructor: FlowView,
            modelConstructor: FlowModel,
            handlerConstructors: [FlowIntersectionHandler, FlowEntryHandler, FlowUpdateHandler],
            data: properties.data,
            initialize: false
        });

        this.model.onFlowEntryAdded = (data) => new FlowEntry({flow: this, data: data as YMap});
        this.model.onFlowSelectorAdded = (data) => new FlowSelector({flow: this, data: data, director: this.director});
        this.mvc.initialize();
    }

    public static createData(data?: SyncedFlow): YMap & SyncedFlow {
        if (!data) data = {};
        if (!data.entries) data.entries = {};
        if (!data.tags) data.tags = [undefined];
        if (!data.defaultName) data.defaultName = "Flow";

        Object.entries(data.entries).forEach(([key, branch]) => data.entries[key] = FlowEntry.createData(branch));
        data.entries = YUtilities.createYMap(data.entries);
        data.tags = YUtilities.createYArray(data.tags.map(tag => FlowSelector.createData(tag)));

        return YUtilities.createYMap(data);
    }

    public get svg(): SVGSVGElement {
        return this.view.svg;
    }

    public get color(): string {
        return this.model.color;
    }

    public get defaultName(): string {
        return this.model.defaultName;
    }

    public get entries(): FlowEntry[] {
        return this.model.entries;
    }

    public get currentEntry(): FlowEntry {
        return this.model.currentEntry;
    }

    public get currentEntryData(): SyncedFlowEntry & YMap {
        return this.currentEntry.data;
    }

    public getEntries(id: string): FlowEntry[] {
        return this.model.entryHandler.getEntries(id);
    }

    // public getEntry(id: string): FlowEntry {
    //     return this.model.entryHandler.getEntry(id);
    // }

    public createEntry(startNodeId: string): SyncedFlowEntry & YMap {
        this.model.currentEntryId = startNodeId;
        return this.model.entryHandler.createEntry({startNodeId: startNodeId, points: []});
    }

    public removeEntry(entry: FlowEntry): void {
        return this.model.entryHandler.removeEntry(entry);
    }

    public getEntriesFromNodesList(nodes: string[]): FlowEntry[] {
        return this.model.entryHandler.getEntriesFromNodesList(nodes);
    }

    public hasNode(id: string): boolean {
        if (this.getEntries(id)?.length > 0) return true;
        for (const entry of this.entries) {
            if (entry.endNodeId === id) return true;
        }
        return false;
    }

    public createSelector(nodeId: string) {
        return YUtilities.addInYArray(FlowSelector.createData({nodeId: nodeId, paths: []}), this.model.selectorsData);
    }

    /**
     * @description Adds the provided point to the flow with the given ID. The node ID indicates the ID of the node
     * the point is in (or null), and isTemporary indicates whether the point is temporarily added to the flow as
     * part of user feedback (to not add it to the synced data).
     * @param p
     * @param isTemporary
     */
    public addPoint(p: Point, isTemporary: boolean = false) {
        this.model.currentEntry?.addPoint(p, isTemporary);
        this.mvc.emitter.fire("__redraw");
    }

    public updateAfterMovingNode(nodeId: string, deltaPosition: Point) {
        return this.model.updateHandler.updateAfterMovingNode(nodeId, deltaPosition);
    }

    public updateOnDetachingNode(nodeId: string) {
        this.model.updateHandler.updateOnDetachingNode(nodeId);
    }
}
