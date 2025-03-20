import {Flow} from "../flow";
import {SyncedFlow, SyncedFlowBranch, SyncedFlowBranchData} from "../flow.types";
import {FlowUtilities} from "../flow.utilities";
import {YArray} from "yjs/dist/src/types/YArray";

export class FlowHandler {
    protected readonly flow: Flow;

    constructor(flow: Flow) {
        this.flow = flow;
    }

    public get flowData(): SyncedFlow {
        return this.flow.data;
    }

    public get flowBranches(): YArray<SyncedFlowBranch, SyncedFlowBranchData> {
        return this.flow.flowBranches;
    }

    protected get svg() {
        return this.flow.svg;
    }

    protected get svgGroups() {
        return this.flow.svgGroups;
    }

    public get lastNode(): string {
        return this.flow.lastNode;
    }

    protected set lastNode(value: string) {
        this.flow.lastNode = value;
    }

    public get currentBranchIndex(): number {
        return this.flow.currentBranchIndex;
    }

    protected set currentBranchIndex(value: number) {
        this.flow.currentBranchIndex = value;
    }

    public get currentBranch(): SyncedFlowBranch {
        return this.flow.currentBranch;
    }

    public get utilities(): FlowUtilities {
        return this.flow.utilities;
    }
}