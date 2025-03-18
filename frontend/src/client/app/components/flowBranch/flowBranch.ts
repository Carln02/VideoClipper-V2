import {Flow} from "../flow/flow";
import {FlowBranchProperties, SyncedFlowBranch} from "./flowBranch.types";
import {FlowBranchModel} from "./flowBranch.model";
import {FlowBranchView} from "./flowBranch.view";
import {SvgNamespace, TurboProxiedElement} from "turbodombuilder";

export class FlowBranch extends TurboProxiedElement<"g", FlowBranchView, SyncedFlowBranch, FlowBranchModel> {
    public readonly flow: Flow;

    public constructor(properties: FlowBranchProperties) {
        super({tag: "g", namespace: SvgNamespace});
        this.flow = properties.flow;
        this.flow?.svg.addChild(this.element);
        this.generateMvc(FlowBranchView, FlowBranchModel, properties.data);
    }
}