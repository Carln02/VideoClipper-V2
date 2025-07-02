import {define} from "turbodombuilder";
import {Flow} from "../../components/flow/flow";
import {VcTool} from "../tool/tool";
import {ToolType} from "../../directors/project/project.types";
import {FlowEntry} from "../../components/flowEntry/flowEntry";

/**
 * @description Tool that handles creating flows and connecting nodes
 */
@define("connection-tool")
export class ConnectionTool extends VcTool<ToolType> {
    private _currentFlow: Flow;
    private _currentFlowId: string;

    public lastNodeId: string = null;

    public color: string = "#439482";

    //Interval indicating the frequency at which points are permanently added to the flow
    //A higher value will increase the smoothing effect of the flow
    public readonly drawingInterval: number = 150 as const;
    //The last time a point was added permanently (used for when drawing flows)
    public lastDrawnTime: number = 0;

    public get currentFlowId(): string {
        return this._currentFlowId;
    }

    public set currentFlowId(value: string) {
        this._currentFlowId = value;
        this._currentFlow = undefined;
    }

    public get currentFlow(): Flow {
        if (!this._currentFlow) this._currentFlow = this.director.getFlow(this.currentFlowId);
        return this._currentFlow;
    }

    public get currentEntry(): FlowEntry {
        return this.currentFlow?.currentEntry;
    }
}