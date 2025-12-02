import {define, turbo} from "turbodombuilder";
import {Flow} from "../../components/flow/flow";
import {tool, Tool} from "../../components/tool/tool";
import {ConnectionModel} from "./connection.model";
import {FlowEntry} from "../../components/flowEntry/flowEntry";
import {ToolProperties} from "../../components/tool/tool.types";
import {ConnectionTool} from "./connection.tool";
import {ConnectionFlowController} from "./connection.flowController";

/**
 * @description Tool that handles creating flows and connecting nodes
 */
@define("vc-connection-tool")
export class Connection extends Tool<any, any, ConnectionModel> {
    public get currentFlow(): Flow {
        if (!this.model.currentFlow) this.model.currentFlow = this.director.getFlow(this.model.currentFlowId);
        return this.model.currentFlow;
    }

    public get currentEntry(): FlowEntry {
        return this.currentFlow?.currentEntry;
    }
}

export function connectionTool(properties: ToolProperties<any, any, ConnectionModel>): Connection {
    turbo(properties).applyDefaults({
        tag: "vc-connection-tool",
        model: ConnectionModel,
        tools: ConnectionTool,
        controllers: ConnectionFlowController
    });
    return tool({...properties}) as Connection;
}