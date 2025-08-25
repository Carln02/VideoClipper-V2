import {TurboHandler} from "turbodombuilder";
import {FlowSelectorModel} from "./flowSelector.model";
import {SyncedFlowPath} from "../flowPath/flowPath.types";

export class FlowSelectorPathHandler extends TurboHandler<FlowSelectorModel> {
    public updatePaths() {
        const oldPaths: Record<string, SyncedFlowPath> = this.model.pathsData.toJSON();
        const newUnnamedPaths: SyncedFlowPath[] = [];

        this.recurFindPaths(this.model.nodeId, [], newUnnamedPaths);
        this.setPathNames(oldPaths, newUnnamedPaths);

        for (const id of Object.keys(oldPaths)) this.model.removePath(id);
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

    private setPathNames(oldPaths: Record<string, SyncedFlowPath>, newUnnamedPaths: SyncedFlowPath[]) {
        const newPaths: Record<string, SyncedFlowPath> = {};

        for (const path of newUnnamedPaths)
            this.namePath(this.matchExactPath(path, oldPaths), path, newPaths, oldPaths, false);
        for (const path of newUnnamedPaths.filter(path => !path.name))
            this.namePath(this.matchOffByOnePath(path, oldPaths), path, newPaths, oldPaths);
        for (const path of newUnnamedPaths.filter(path => !path.name))
            this.namePath(this.matchOffBySectionPath(path, oldPaths), path, newPaths, oldPaths);

        const usedNames = new Set(Object.values(newPaths).map(p => p.name));
        const baseName = this.model.flow.defaultName ?? "Path";
        let counter = 0;

        for (const path of newUnnamedPaths.filter(p => !p.name)) {
            do counter++;
            while (usedNames.has(`${baseName} ${counter}`));
            path.name = `${baseName} ${counter}`;
            this.model.setPath(path);
        }
    }

    private namePath(match: string, path: SyncedFlowPath, newPaths: Record<string, SyncedFlowPath>,
                     oldPaths: Record<string, SyncedFlowPath>, setData: boolean = true) {
        if (!match) return;
        newPaths[match] = path;
        path.name = oldPaths[match].name;
        delete oldPaths[match];
        if (setData) this.model.setPath(path, match);
    }

    private matchExactPath(path: SyncedFlowPath, oldPaths: Record<string, SyncedFlowPath>): string | undefined {
        for (const [id, oldPath] of Object.entries(oldPaths)) {
            if (!oldPath) continue;
            if (oldPath.nodeIds?.join(",") === path.nodeIds?.join(",")) return id;
        }
        return undefined;
    }

    private matchOffByOnePath(path: SyncedFlowPath, oldPaths: Record<string, SyncedFlowPath>): string | undefined {
        const newNodeIds = path.nodeIds ?? [];
        for (const [id, oldPath] of Object.entries(oldPaths)) {
            if (!oldPath) continue;
            const oldNodeIds = oldPath.nodeIds ?? [];
            if (Math.abs(oldNodeIds.length - newNodeIds.length) > 1) continue;

            let diffCount = 0;
            for (let i = 0; i < Math.min(oldNodeIds.length, newNodeIds.length); i++) {
                if (oldNodeIds[i] !== newNodeIds[i]) diffCount++;
            }
            if (diffCount <= 1) return id;
        }
        return undefined;
    }

    private matchOffBySectionPath(path: SyncedFlowPath, oldPaths: Record<string, SyncedFlowPath>): string | undefined {
        const newNodeIds = path.nodeIds ?? [];
        for (const [id, oldPath] of Object.entries(oldPaths)) {
            if (!oldPath) continue;
            const oldNodeIds = oldPath.nodeIds ?? [];

            let diffSectionCount = 0;
            let prevWasDiff = false;
            for (let i = 0; i < Math.min(oldNodeIds.length, newNodeIds.length); i++) {
                const isDiff = oldNodeIds[i] !== newNodeIds[i];
                if (isDiff && !prevWasDiff) diffSectionCount++;
                prevWasDiff = isDiff;
            }
            if (diffSectionCount === 0 || diffSectionCount === 1 && prevWasDiff) return id;
        }
        return undefined;
    }
}