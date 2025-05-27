import {TurboHandler} from "turbodombuilder";
import {FlowBranchModel} from "./flowBranch.model";

export class FlowBranchCleaningHandler extends TurboHandler<FlowBranchModel> {
    public checkIfUnnecessary(): boolean {
        const entriesArray = this.model.entries;
        //If less than 2 entries --> unnecessary
        if (entriesArray.length < 2) return true;
        //Otherwise, if more than 2 entries --> keep
        else if (entriesArray.length > 2) return false;

        //If 2 entries that do not each belong to a node --> unnecessary
        return (!entriesArray[0].startNodeId || entriesArray[0].startNodeId.length === 0)
            || (!entriesArray[1].startNodeId || entriesArray[1].startNodeId.length === 0)
            || entriesArray[0].startNodeId != entriesArray[0].endNodeId
            || entriesArray[1].startNodeId != entriesArray[1].endNodeId;
    }
    public endBranch() {
        //Clear temporary point
        this.model.temporaryPoint = null;

        const entriesArray = this.model.entries;
        // if (entriesArray.length < 2) return;

        const lastEntry = entriesArray[entriesArray.length - 1];
        //If flow ends with an entry that doesn't have an end node --> the flow was stopped outside a node --> remove
        //the last entry and save
        if (!lastEntry.endNodeId || lastEntry.endNodeId === "") this.model.entryHandler.removeEntryAt(entriesArray.length - 1);
    }
}