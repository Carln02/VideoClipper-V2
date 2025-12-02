import {auto, cache, TurboModel} from "turbodombuilder";
import {Flow} from "../../components/flow/flow";
import {FlowEntry} from "../../components/flowEntry/flowEntry";

export class ConnectionModel extends TurboModel {
    public currentFlow: Flow;
    public lastNodeId: string = null;

    public color: string = "#439482";

    //Interval indicating the frequency at which points are permanently added to the flow
    //A higher value will increase the smoothing effect of the flow
    public readonly drawingInterval: number = 300 as const;
    //The last time a point was added permanently (used for when drawing flows)
    public lastDrawnTime: number = 0;

    @auto() public set currentFlowId(value: string) {
        this.currentFlow = undefined;
    }

    public clear() {
        this.currentFlow?.clearCurrentEntry();
        this.currentFlowId = null;
        this.lastNodeId = null;
    }
}