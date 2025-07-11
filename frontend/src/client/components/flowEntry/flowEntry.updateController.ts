import {Point, TurboController} from "turbodombuilder";
import {FlowEntryModel} from "./flowEntry.model";
import {FlowEntry} from "./flowEntry";
import {FlowEntryView} from "./flowEntry.view";

export class FlowEntryUpdateController extends TurboController<FlowEntry, FlowEntryView, FlowEntryModel> {
    /**
     * @description Updates all impacted flows after the node of the provided ID was moved by deltaPosition.
     * @param nodeId
     * @param deltaPosition
     */
    public updateAfterMovingNode(nodeId: string, deltaPosition: Point) {
        if (!nodeId) return;

        //I move each point by deltaPosition multiplied by a moveFactor (linearly interpolated based on the number of
        // points and how close the current point is from the moved node) for a natural-looking update of the flow
        for (let i = 0; i < this.element.points.length; i++) {
            //Compute interpolation amount (both sides incremented by 1 to soften the effect)
            let moveFactor = i / (this.element.points.length - 1);
            //Flip interpolation if points start from the given node (as then it should start high and end low)
            if (this.model.startNodeId == nodeId) moveFactor = 1 - moveFactor;
            //Update accordingly the point's coordinates
            this.element.incrementPoint(i, deltaPosition.mul(moveFactor));
        }
    }
}