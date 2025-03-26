import {TurboHandler} from "turbodombuilder";
import {FlowBranchModel} from "./flowBranch.model";
import {FlowEntryModel} from "../flowEntry/flowEntry.model";

export class FlowBranchCleaningHandler extends TurboHandler<FlowBranchModel> {
    public checkIfUnnecessary(): boolean {
        const entriesArray = this.model.entriesArray;
        //If less than 2 entries --> unnecessary
        if (entriesArray.length < 2) return true;
        //Otherwise, if more than 2 entries --> keep
        else if (entriesArray.length > 2) return false;

        const firstEntry = new FlowEntryModel(entriesArray[0]);
        const secondEntry = new FlowEntryModel(entriesArray[1]);

        //If 2 entries that do not each belong to a node --> unnecessary
        return firstEntry.startNodeId != firstEntry.endNodeId || secondEntry.startNodeId != secondEntry.endNodeId;
    }

    public endBranch() {
        //Clear temporary point
        this.model.temporaryPoint = null;

        const entriesArray = this.model.entriesArray;
        if (entriesArray.length < 2) return;

        const lastEntry = new FlowEntryModel(entriesArray[entriesArray.length - 1]);

        //If flow ends with an entry that doesn't have an end node --> the flow was stopped outside a node --> remove
        //the last entry and save
        if (lastEntry.endNodeId == undefined) this.model.entryHandler.removeEntryAt(entriesArray.length - 1);
    }
}