import {TurboHandler} from "turbodombuilder";
import {FlowBranchModel} from "./flowBranch.model";
import {YArray} from "../../../../yManagement/yManagement.types";

export class FlowBranchConnectionHandler extends TurboHandler<FlowBranchModel> {
    public get connectedBranchesCount(): number {
        return this.model.connectedBranches.length;
    }

    public isConnectedTo(branch: string) {
        for (const entry of this.model.connectedBranches.toArray()) {
            if (entry == branch) return true;
        }
        return false;
    }

    public isConnectedToAll(...branches: string[]) {
        for (const branch of branches) {
            if (!this.isConnectedTo(branch)) return false;
        }
        return true;
    }

    public addConnectedBranch(...branches: string[]) {
        for (const branch of branches) {
            if (!this.isConnectedTo(branch)) this.model.connectedBranches.push([branch]);
        }
    }

    public clearConnectedBranches() {
        this.model.connectedBranches.delete(0, this.connectedBranchesCount);
    }

    public setConnectedBranches(branches: string[] | YArray<string>) {
        if (branches instanceof YArray) branches = branches.toArray();
        this.clearConnectedBranches();
        this.addConnectedBranch(...branches);
    }
}