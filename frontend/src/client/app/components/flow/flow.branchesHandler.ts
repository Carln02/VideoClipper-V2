import {Point, TurboHandler} from "turbodombuilder";
import {FlowModel} from "./flow.model";
import {SyncedFlowBranch} from "../flowBranch/flowBranch.types";
import {FlowBranch} from "../flowBranch/flowBranch";
import {FlowPoint} from "./flow.types";
import {FlowEntryModel} from "../flowEntry/flowEntry.model";
import {SyncedFlowEntry} from "../flowEntry/flowEntry.types";
import {YUtilities} from "../../../../yManagement/yUtilities";
import structuredClone from "@ungap/structured-clone";
import {FlowPathModel} from "../flowPath/flowPath.model";

export class FlowBranchesHandler extends TurboHandler<FlowModel> {
    public getBranchById(id: string): FlowBranch {
        return this.model.branchesModel.getInstance(id);
    }

    public getBranchDataById(id: string): SyncedFlowBranch {
        return this.getBranchById(id).data;
    }

    public getBranchId(branch: FlowBranch): string {
        for (const [key, value] of this.model.branchesModel.data) {
            if (value == branch.data) return key;
        }
        return null;
    }

    public removeBranch(branch: FlowBranch) {
        if (branch.dataId) this.removeBranchAt(branch.dataId);
        else this.removeBranchAt(this.getBranchId(branch));
    }

    public removeBranchAt(id: string) {
        this.model.branchesModel.data.delete(id);
    }

    /**
     * @description Branches the flow with the given ID at the provided point, cutting the original flow into two
     * branches at this point's flow entry, and creating a new branch starting from the point's flow entry with all
     * the points up to the target.
     * @param p
     * @param branchPosition
     * @param nodeId
     * @param createThirdBranch
     * @param isOverwritingSibling
     */
    public async branchAtPoint(
        p: FlowPoint,
        branchPosition?: Point,
        nodeId?: string,
        createThirdBranch: boolean = true,
        isOverwritingSibling: boolean = false
    ) {
        if (!this.model.data || !p || p.branchId == undefined || p.entryIndex == undefined) return;

        //TODO HANDLE CASE WHERE ALRDY BRANCHED/FROM THE BEGINNING OF FLOW
        const parentBranchId = p.branchId!;
        const entryIndex = p.entryIndex!;
        const parentBranch = this.model.branchHandler.getBranchById(parentBranchId);
        const originalEntry = new FlowEntryModel(parentBranch.getEntry(p.entryIndex));
        const splitPointIndex = p.pointIndex != undefined ? p.pointIndex : Math.floor(originalEntry.points.length - 1 / 2);
        const originalEntries: SyncedFlowEntry[] = parentBranch.entries.toJSON();

        const {beforeSplit, splitEntry, afterSplit} =
            originalEntry.splitAtPoint(splitPointIndex, nodeId!, branchPosition
                ? new Point(this.model.intersectionHandler.closestPointOnPath(branchPosition, 200).point).object
                : originalEntry.points[splitPointIndex]);

        parentBranch.spliceEntries(entryIndex - 1, undefined, structuredClone(beforeSplit));

        const newChildId = await YUtilities.addInYMap(FlowBranch.createData({
            entries: structuredClone([afterSplit, ...originalEntries.slice(entryIndex + 1)])
        }), this.model.branchesModel.data);
        if (this.model.currentBranchId == parentBranchId) this.model.currentBranchId = newChildId;

        this.getBranchById(newChildId).setConnectedBranches(parentBranch.connectedBranches);
        parentBranch.setConnectedBranches([newChildId]);

        if (createThirdBranch) {
            this.model.currentBranchId = await YUtilities.addInYMap(FlowBranch.createData({
                entries: [structuredClone(splitEntry)],
                overwriting: isOverwritingSibling ? newChildId : undefined,
            }), this.model.branchesModel.data);
            parentBranch.addConnectedBranch(this.model.currentBranchId);
        }

        // const branchOnNode = nodeId != undefined
        //     || (!branchPosition && parentBranch.getEntry(entryIndex).startNodeId
        //         == parentBranch.getEntry(entryIndex).endNodeId);

        //TODO UPDATE CONNECTIONS
        // this.utilities.loopOnFlowTagEntries((namedPath) => {
        //     const i = namedPath.branchIndices.indexOf(parentBranchIndex);
        //     if (i >= 0) namedPath.branchIndices.splice(i, 0, firstChildIndex);
        // });

        //TODO optimize
        // this.optimizeBranches();


        //TODO RELOAD PATHS
        // const newNamedPaths = new Map<SyncedFlowTag, YProxiedArray<NamedFlowPath, NamedFlowPathData>>();
        // this.utilities.loopOnFlowTagEntries((namedPath, tag) => {
        //     const i = namedPath.branchIndices.indexOf(parentBranchIndex);
        //     if (i < 0) return;
        //     const nextIndex = this.utilities.findNextTagNameIndex(namedPath.name);
        //     if (!newNamedPaths.get(tag)) newNamedPaths.set(tag, [] as YProxiedArray<NamedFlowPath>);
        //     newNamedPaths.get(tag)!.push({
        //         name: namedPath.name,
        //         index: nextIndex,
        //         branchIndices: [
        //             ...namedPath.branchIndices.slice(0, i + 1),
        //             secondChildIndex
        //         ]
        //     });
        // });
        // newNamedPaths.forEach((paths, tag) => tag.namedPaths.push(...paths));
    }

    public updateConnectionsAfterBranching(parentBranchId: string, firstChildBranchId: string, secondChildBranchId?: string) {
        const parentBranch = this.getBranchById(parentBranchId);

        this.getBranchById(firstChildBranchId).setConnectedBranches(parentBranch.connectedBranches);
        parentBranch.setConnectedBranches([firstChildBranchId]);
        if (secondChildBranchId) parentBranch.addConnectedBranch(secondChildBranchId);

        this.model.tags.forEach(tag => {
            tag.pathsArray.forEach((pathData, index) => {
                const path = new FlowPathModel(pathData);
                const parentBranchIndex = path.branchIdsArray.indexOf(parentBranchId);
                if (parentBranchIndex < 0) return;
                path.insertBranchAt(firstChildBranchId, parentBranchIndex + 1);
                if (secondChildBranchId) tag.insertPath({
                    branchIds: [...path.branchIdsArray.slice(0, parentBranchIndex), secondChildBranchId],
                    name: path.name
                }, index + 1);
            });
        })
    }

    public getPathsFromNode(nodeId: string): string[][] {
        const entries: FlowPoint[] = this.model.searchHandler.findNodeEntries(nodeId);
        const paths: string[][] = [];

        const recurGetPath = (path: string[]): void => {
            const childIndices = this.model.branches[path.length - 1]?.connectedBranchesArray || [];
            if (childIndices.length == 0) {
                if (path.length > 0) paths.push([...path]);
                return;
            }
            for (const id of childIndices) recurGetPath([...path, id]);
        }

        entries.forEach(entry => recurGetPath([entry.branchId]));
        return paths;
    }
}