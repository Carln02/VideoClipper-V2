import {define, Point} from "turbodombuilder";
import {Canvas} from "../../views/canvas/canvas";
import "./flow.css";
import {SyncedComponent} from "../../abstract/syncedComponent/syncedComponent";
import {SyncedFlow, SyncedFlowBranch, SyncedFlowData, SyncedFlowTag} from "./flow.types";
import {FlowTag} from "../flowTag/flowTag";
import {FlowDrawingHandler} from "./handlers/types/flowDrawing.handler";
import {FlowPointHandler} from "./handlers/types/flowPoint.handler";
import {FlowSearchHandler} from "./handlers/types/flowSearch.handler";
import {FlowUtilities} from "./flow.utilities";
import {FlowBranchingHandler} from "./handlers/types/flowBranching.handler";
import {FlowManagementHandler} from "./handlers/types/flowManagement.handler";
import {FlowIntersectionHandler} from "./handlers/types/flowIntersection.handler";
import * as d3 from "d3";
import {SyncedType, YWrapObserver} from "../../abstract/syncedComponent/syncedComponent.types";

/**
 * @description A reactiveComponent that represents a flow connecting cards
 */
@define("vc-flow")
export class Flow extends SyncedComponent<SyncedFlow> implements YWrapObserver<SyncedFlow> {
    public readonly svg: SVGSVGElement;
    public readonly svgGroups: Map<number, SVGGElement>;

    public readonly utilities: FlowUtilities;

    public readonly drawingHandler: FlowDrawingHandler;
    public readonly intersectionHandler: FlowIntersectionHandler;

    public readonly pointHandler: FlowPointHandler;
    public readonly branchingHandler: FlowBranchingHandler;
    public readonly managementHandler: FlowManagementHandler;
    public readonly searchHandler: FlowSearchHandler;

    private flowTagsElements: FlowTag[] = [];

    // The last node attached to this flow
    public lastNode: string = null;

    public currentBranchIndex: number = 0;

    constructor(data: SyncedFlow, parent: HTMLElement) {
        super({parent: parent});

        this.data = data;

        //Create SVG using D3
        this.svg = d3.select(this).append("svg")
            .attr("namespace", "http://www.w3.org/2000/svg").node();
        this.svgGroups = new Map<number, SVGGElement>();

        this.utilities = new FlowUtilities(this);

        this.drawingHandler = new FlowDrawingHandler(this);
        this.intersectionHandler = new FlowIntersectionHandler(this);

        this.pointHandler = new FlowPointHandler(this);
        this.branchingHandler = new FlowBranchingHandler(this);
        this.managementHandler = new FlowManagementHandler(this);
        this.searchHandler = new FlowSearchHandler(this);
    }

    public static async create(p: Point, nodeId: string): Promise<Flow> {
        this.root.counters.flows++;
        const defaultName = "Flow " + this.root.counters.flows;
        let data: SyncedFlowData = {
            defaultName: defaultName,
            flowBranches: [{
                flowEntries: [{startNodeId: nodeId, endNodeId: nodeId, points: [p.object]}],
                childBranches: []
            }] as SyncedType<SyncedFlowBranch[]>,
            flowTags: [{
                nodeId: nodeId,
                namedPaths: [{
                    name: defaultName,
                    index: 1,
                    branchIndices: [0]
                }]
            } as SyncedFlowTag]
        };

        const id = await super.createInObject(data, this.root.flows as SyncedType<Record<string, SyncedFlow>>);
        data = this.root.flows[id];
        data.flowBranches.set_observable();
        data.flowTags.forEach(flowTag => flowTag.set_observable());

        return new Flow(this.root.flows[id], Canvas.instance?.flowsParent);
    }

    public static getAll(): Flow[] {
        return Object.values(this.root.flows)
            .flatMap(flowData => flowData.get_observers())
            .filter(observer => observer instanceof Flow);
    }

    public static getDataById(id: string): SyncedFlow {
        return this.root.flows[id];
    }

    public static getById(id: string): Flow {
        for (const observer of this.getDataById(id).get_observers()) {
            if (observer instanceof Flow) return observer;
        }
        return null;
    }

    public get flowBranches(): SyncedType<SyncedFlowBranch[]> {
        return this.data.flowBranches;
    }

    public get currentBranch(): SyncedFlowBranch {
        return this.data.flowBranches[this.currentBranchIndex];
    }

    public onFlowTagsUpdated(newValue: SyncedFlowTag, oldValue: SyncedFlowTag, path: (string | number)[]) {
        if (path.length == 0) return newValue.forward_callbacks(this);
        if (!newValue && !oldValue) return;

        const index = (oldValue || newValue).get_key() as number;

        if (!newValue) {
            this.flowTagsElements[index]?.destroy();
            this.flowTagsElements.splice(index, 1);
        } else if (!oldValue) {
            const flowTag = new FlowTag(this, newValue);
            this.flowTagsElements.splice(index, 0, flowTag);
        } else {
            const flowTag = this.flowTagsElements[index];
            if (flowTag) flowTag.data = newValue;
        }
    }
}
