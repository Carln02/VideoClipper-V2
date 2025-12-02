import {TurboController, TurboEvent} from "turbodombuilder";
import {ConnectionModel} from "./connection.model";
import {Connection} from "./connection";

export class ConnectionFlowController extends TurboController<Connection, any, ConnectionModel> {
    protected setupChangedCallbacks() {
        super.setupChangedCallbacks();
        this.emitter.add("initializeFlow", (e: TurboEvent) => this.initializeFlow(e));
        this.emitter.add("clearFlow", () => this.clearFlow());
    }

    private async initializeFlow(e: TurboEvent) {
        //Reset drawing time
        this.model.lastDrawnTime = Date.now();

        const existingFlow = this.element.director.flows.find(flow => flow.color === this.model.color);
        if (existingFlow) {
            this.model.currentFlowId = existingFlow.dataId;
            if (!existingFlow.hasNode(this.model.lastNodeId)) existingFlow.createSelector(this.model.lastNodeId);
        } else {
            this.model.currentFlowId = await this.element.director
                .createNewFlow(e.scaledPosition, this.model.lastNodeId, this.model.color);
        }
    }

    private clearFlow() {
        this.element.currentFlow.clearCurrentEntry();
        this.model.currentFlowId = null;
        this.model.lastNodeId = null;
    }
}