import {TurboHandler} from "turbodombuilder";
import {FlowModel} from "./flow.model";

export class FlowCleaningHandler extends TurboHandler<FlowModel> {
    /**
     * @description Removes the branches in the flow with the given ID if they don't represent a path that at least
     * connects two nodes, and removes the flow if it is empty.
     */
    public removeUnnecessaryBranchesOrFlow() {
        for (const branch of this.model.branches) {
            if (branch.checkIfUnnecessary()) {
                branch.clearDrawing();
                this.model.branchHandler.removeBranch(branch);
            }
        }

        // TODO MOVE TO DOCUMENT MANAGER
        // // Delete the flow if it has no branches
        // if (this.model.branches.length == 0) {
        //     this.flow.delete();
        //     return null;
        // }
    }

    /**
     * @description Ends the flow with the given ID by removing
     */
    public endFlow() {
        for (const branch of this.model.branches) {
            branch.endBranch();
            //If branch is temporary --> overwrite target branch
            //TODO if (branch.isOverwriting) this.flow.branchingHandler.overwriteBranch(currentBranch.overwriting, this.currentBranchIndex);
        }

        //Clean up the flow
        this.removeUnnecessaryBranchesOrFlow();
        //Optimize it
        //TODO this.flow.branchingHandler.optimizeBranches();
    }
}