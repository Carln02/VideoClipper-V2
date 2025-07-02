import {TurboHandler} from "turbodombuilder";
import {FlowSelectorModel} from "./flowSelector.model";
import {SyncedFlowPath} from "../flowPath/flowPath.types";
import {YUtilities} from "../../../yManagement/yUtilities";
import {FlowPath} from "../flowPath/flowPath";

export class FlowSelectorPathHandler extends TurboHandler<FlowSelectorModel> {
    public updatePaths() {
        const oldPaths: SyncedFlowPath[] = this.model.pathsData.toJSON();
        const newPaths: SyncedFlowPath[] = [];

        this.recurFindPaths(this.model.nodeId, [], newPaths);
        this.setPathNames(oldPaths, newPaths);

        this.model.pathsData = YUtilities.createYArray(newPaths.map(path => FlowPath.createData(path)));
    }

    private recurFindPaths(currentNodeId: string, currentPath: string[], paths: SyncedFlowPath[]) {
        currentPath.push(currentNodeId);

        const entries = this.model.flow.getEntries(currentNodeId);
        if (!entries || entries.length === 0) {
            paths.push({nodeIds: [...currentPath]});
        } else {
            for (const entry of entries) {
                const nextNodeId = entry.endNodeId;
                if (!nextNodeId || currentPath.includes(nextNodeId)) continue;
                this.recurFindPaths(nextNodeId, [...currentPath], paths);
            }
        }
    }

    private setPathNames(oldPaths: SyncedFlowPath[], newPaths: SyncedFlowPath[]) {
        for (const path of newPaths) {
            const oldMatch = this.matchExactPathName(path, oldPaths);
            if (!oldMatch) continue;
            path.name = oldMatch.name;
            this.deleteEntry(oldMatch, oldPaths);
        }

        for (const path of newPaths.filter(path => !path.name)) {
            const oldMatch = this.matchSimilarPathName(path, oldPaths);
            if (!oldMatch) continue;
            path.name = oldMatch.name;
            this.deleteEntry(oldMatch, oldPaths);
        }

        const usedNames = new Set(newPaths.map(p => p.name).filter(Boolean));
        for (const path of newPaths.filter(p => !p.name)) {
            const baseName = this.model.flow.defaultName ?? "Path";
            let counter = 1;
            while (usedNames.has(`${baseName} ${counter}`)) counter++;
            path.name = `${baseName} ${counter}`;
            usedNames.add(path.name);
        }
    }

    private matchExactPathName(path: SyncedFlowPath, oldPaths: SyncedFlowPath[]): SyncedFlowPath {
        return oldPaths.find(oldPath =>
            oldPath.nodeIds?.join(",") === path.nodeIds?.join(","));
    }

    private matchSimilarPathName(path: SyncedFlowPath, oldPaths: SyncedFlowPath[]): SyncedFlowPath {
        return oldPaths.find(oldPath => {
            const oldNodeIds = oldPath.nodeIds ?? [];
            const newNodeIds = path.nodeIds ?? [];
            if (Math.abs(oldNodeIds.length - newNodeIds.length) > 1) return false;

            let diffCount = 0;
            for (let i = 0; i < Math.min(oldNodeIds.length, newNodeIds.length); i++) {
                if (oldNodeIds[i] !== newNodeIds[i]) diffCount++;
            }
            return diffCount <= 1;
        });
    }

    private deleteEntry(entry: any, oldArray: any[]): boolean {
        const index = oldArray.indexOf(entry);
        if (index < 0) return false;
        oldArray.splice(index, 1);
        return true;
    }
}