import {Point, TurboHandler} from "turbodombuilder";
import {FlowModel} from "./flow.model";


export class FlowUpdateHandler extends TurboHandler<FlowModel> {
    /**
     * @description Updates all impacted flows after the node of the provided ID was moved by deltaPosition.
     * @param nodeId
     * @param deltaPosition
     */
    public updateAfterMovingNode(nodeId: string, deltaPosition: Point) {
        if (!nodeId) return;
        const flowEntries = this.model.entries;

        for (let i = 0; i < flowEntries.length; i++) {
            const entry = flowEntries[i];
            if (entry.startNodeId != nodeId && entry.endNodeId != nodeId) continue;
            entry.updateAfterMovingNode(nodeId, deltaPosition);
        }
    }

    public updateOnDetachingNode(nodeId: string): boolean {
        if (!nodeId) return;

        const flowEntries = this.model.entries;
        for (let i = flowEntries.length - 1; i >= 0; i--) {
            const entry = flowEntries[i];
            // If the entry is not connected to the card on any end --> skip it
            if (entry.startNodeId != nodeId && entry.endNodeId != nodeId) continue;
            //Otherwise --> delete entry
            entry.delete();
        }
    }
}