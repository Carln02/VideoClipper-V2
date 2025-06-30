import {TurboHandler} from "turbodombuilder";
import {FlowModel} from "./flow.model";
import {SyncedFlowEntry} from "../flowEntry/flowEntry.types";
import {YManagerModel} from "../../../yManagement/yModel/types/yManagerModel";
import {YMap} from "../../../yManagement/yManagement.types";
import {FlowEntry} from "../flowEntry/flowEntry";
import {randomString} from "../../utils/random";

export class FlowEntryHandler extends TurboHandler<FlowModel> {
    private entryModel: YManagerModel<SyncedFlowEntry & YMap, FlowEntry, string, YMap>;

    public onFlowEntryAdded: (data: SyncedFlowEntry) => FlowEntry;

    public constructor(model: FlowModel) {
        super(model);
        this.entryModel = new YManagerModel();
        this.entryModel.onAdded = data => this.onFlowEntryAdded?.(data);
    }

    public setData(data: YMap<SyncedFlowEntry>) {
        this.entryModel.data = data;
    }

    public getEntries(): FlowEntry[] {
        return this.entryModel.getAllComponents();
    }

    public getEntriesData(): (SyncedFlowEntry & YMap)[] {
        return this.entryModel.getAllData() as (SyncedFlowEntry & YMap)[];
    }

    public getEntryData(id: string): YMap & SyncedFlowEntry {
        return this.entryModel.getData(id);
    }

    public getEntry(id: string): FlowEntry {
        return this.entryModel.getInstance(id);
    }

    public createEntry(data: SyncedFlowEntry): SyncedFlowEntry & YMap {
        if (!data || !data.startNodeId || !this.entryModel.data) return null;
        const entry = FlowEntry.createData(data);
        this.entryModel.data.set(data.startNodeId, entry);
        return entry;
    }

    public addEntry(entry: FlowEntry | (SyncedFlowEntry & YMap), id ?: string) {
        if (entry instanceof FlowEntry) entry = entry.data;
        if (!id) while (!id || this.getEntryData(id)) id = randomString(16);
        this.model.entriesData.set(id, entry);
    }

    public addNewEntry(data: FlowEntry | SyncedFlowEntry, id ?: string) {
        this.addEntry((data instanceof YMap || data instanceof FlowEntry) ? data : this.createEntry(data), id);
    }

    public removeEntry(entry: FlowEntry) {
        for (const [id, value] of Array.from(this.model.entriesData.entries())) {
            if (value !== entry.data) continue;
            this.model.entriesData.delete(id);
            return;
        }
    }

    public setEntry(entry: FlowEntry, id ?: string) {
        this.removeEntry(entry);
        this.addEntry(entry.data, id);
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

    // /**
    //  * @description Branches the flow with the given ID at the provided point, cutting the original flow into two
    //  * branches at this point's flow entry, and creating a new branch starting from the point's flow entry with all
    //  * the points up to the target.
    //  * @param p
    //  * @param branchPosition
    //  * @param nodeId
    //  * @param createThirdBranch
    //  * @param isOverwritingSibling
    //  */
    // public async branchAtPoint(
    //     p: FlowPoint,
    //     branchPosition?: Point,
    //     nodeId?: string,
    //     createThirdBranch: boolean = true,
    //     isOverwritingSibling: boolean = false
    // ) {
    //     if (!this.model.data || !p || p.branchId == undefined || p.entryIndex == undefined) return;
    //
    //     //TODO HANDLE CASE WHERE ALRDY BRANCHED/FROM THE BEGINNING OF FLOW
    //     const parentBranchId = p.branchId!;
    //     const entryIndex = p.entryIndex!;
    //     const parentBranch = this.model.branchHandler.getBranchById(parentBranchId);
    //     const originalEntry = parentBranch.getEntry(p.entryIndex);
    //     const splitPointIndex = p.pointIndex != undefined ? p.pointIndex : Math.floor(originalEntry.points.length - 1 / 2);
    //     const originalEntries: SyncedFlowEntry[] = parentBranch.entriesData.toJSON();
    //
    //     const {beforeSplit, splitEntry, afterSplit} =
    //         originalEntry.splitAtPoint(splitPointIndex, nodeId!, branchPosition
    //             ? new Point(this.model.intersectionHandler.closestPointOnPath(branchPosition, 200).point).object
    //             : originalEntry.points[splitPointIndex]);
    //
    //     parentBranch.spliceEntries(entryIndex - 1, undefined, structuredClone(beforeSplit));
    //
    //     const newChildId = await YUtilities.addInYMap(FlowBranch.createData({
    //         entries: structuredClone([afterSplit, ...originalEntries.slice(entryIndex + 1)])
    //     }), this.model.branchesModel.data);
    //     if (this.model.currentBranchId == parentBranchId) this.model.currentBranchId = newChildId;
    //
    //     // this.getBranchById(newChildId).setConnectedBranches(parentBranch.connectedBranches);
    //     // parentBranch.setConnectedBranches([newChildId]);
    //
    //     if (createThirdBranch) {
    //         this.model.currentBranchId = await YUtilities.addInYMap(FlowBranch.createData({
    //             entries: [structuredClone(splitEntry)],
    //             overwriting: isOverwritingSibling ? newChildId : undefined,
    //         }), this.model.branchesModel.data);
    //         // parentBranch.addConnectedBranch(this.model.currentBranchId);
    //     }
    //
    //     this.updateConnectionsAfterBranching(parentBranchId, newChildId, createThirdBranch ? this.model.currentBranchId : undefined);
    //
    //     // const branchOnNode = nodeId != undefined
    //     //     || (!branchPosition && parentBranch.getEntry(entryIndex).startNodeId
    //     //         == parentBranch.getEntry(entryIndex).endNodeId);
    //
    //     //TODO UPDATE CONNECTIONS
    //     // this.utilities.loopOnFlowTagEntries((namedPath) => {
    //     //     const i = namedPath.branchIndices.indexOf(parentBranchIndex);
    //     //     if (i >= 0) namedPath.branchIndices.splice(i, 0, firstChildIndex);
    //     // });
    //
    //     //TODO optimize
    //     // this.optimizeBranches();
    //
    //
    //     //TODO RELOAD PATHS
    //     // const newNamedPaths = new Map<SyncedFlowTag, YProxiedArray<NamedFlowPath, NamedFlowPathData>>();
    //     // this.utilities.loopOnFlowTagEntries((namedPath, tag) => {
    //     //     const i = namedPath.branchIndices.indexOf(parentBranchIndex);
    //     //     if (i < 0) return;
    //     //     const nextIndex = this.utilities.findNextTagNameIndex(namedPath.name);
    //     //     if (!newNamedPaths.get(tag)) newNamedPaths.set(tag, [] as YProxiedArray<NamedFlowPath>);
    //     //     newNamedPaths.get(tag)!.push({
    //     //         name: namedPath.name,
    //     //         index: nextIndex,
    //     //         branchIndices: [
    //     //             ...namedPath.branchIndices.slice(0, i + 1),
    //     //             secondChildIndex
    //     //         ]
    //     //     });
    //     // });
    //     // newNamedPaths.forEach((paths, tag) => tag.namedPaths.push(...paths));
    // }

    // public updateConnectionsAfterBranching(parentBranchId: string, firstChildBranchId: string, secondChildBranchId?: string) {
    //     const parentBranch = this.getBranchById(parentBranchId);
    //
    //     this.getBranchById(firstChildBranchId).setConnectedBranches(parentBranch.connectedBranches);
    //     parentBranch.setConnectedBranches([firstChildBranchId]);
    //     if (secondChildBranchId) parentBranch.addConnectedBranch(secondChildBranchId);
    //
    //     this.model.tags.forEach(tag => {
    //         tag.pathsArray.forEach((pathData, index) => {
    //             const path = new FlowPathModel(pathData);
    //             const parentBranchIndex = path.branchIdsArray.indexOf(parentBranchId);
    //             if (parentBranchIndex < 0) return;
    //             path.insertBranchAt(firstChildBranchId, parentBranchIndex + 1);
    //             if (secondChildBranchId) tag.insertPath({
    //                 branchIds: [...path.branchIdsArray.slice(0, parentBranchIndex + 1), secondChildBranchId],
    //                 name: this.model.defaultName + " - " + (tag.pathsArray.length + 1),
    //             }, index + 1);
    //         });
    //     })
    // }

    // public getPathsFromNode(nodeId: string): string[][] {
    //     const entries: FlowPoint[] = this.model.searchHandler.findNodeEntries(nodeId);
    //     const paths: string[][] = [];
    //
    //     const recurGetPath = (path: string[]): void => {
    //         const childIndices = this.model.branches[path.length - 1]?.connectedBranchesArray || [];
    //         if (childIndices.length == 0) {
    //             if (path.length > 0) paths.push([...path]);
    //             return;
    //         }
    //         for (const id of childIndices) recurGetPath([...path, id]);
    //     }
    //
    //     entries.forEach(entry => recurGetPath([entry.branchId]));
    //     return paths;
    // }
}