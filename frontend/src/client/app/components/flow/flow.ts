import {define, Point, TurboCustomProperties, TurboElement} from "turbodombuilder";
import "./flow.css";
import {SyncedFlow} from "./flow.types";
import {FlowTag} from "../flowTag/flowTag";
import {FlowDrawingHandler} from "./handlers/types/flowDrawing.handler";
import {FlowPointHandler} from "./handlers/types/flowPoint.handler";
import {FlowSearchHandler} from "./handlers/types/flowSearch.handler";
import {FlowUtilities} from "./flow.utilities";
import {FlowBranchingHandler} from "./handlers/types/flowBranching.handler";
import {FlowManagementHandler} from "./handlers/types/flowManagement.handler";
import {FlowIntersectionHandler} from "./handlers/types/flowIntersection.handler";
import {FlowView} from "./flow.view";
import {FlowModel} from "./flow.model";
import {SyncedFlowBranch} from "../flowBranch/flowBranch.types";
import { YArray } from "../../../../yManagement/yManagement.types";

/**
 * @description A reactiveComponent that represents a flow connecting cards
 */
@define("vc-flow")
export class Flow extends TurboElement<FlowView, SyncedFlow, FlowModel> {
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

    public constructor(properties: TurboCustomProperties<FlowView, SyncedFlow, FlowModel>) {
        super(properties);
        this.mvc.generate(FlowView, FlowModel, properties.data);


        this.utilities = new FlowUtilities(this);

        this.drawingHandler = new FlowDrawingHandler(this, data.flowBranches);
        this.intersectionHandler = new FlowIntersectionHandler(this);

        this.pointHandler = new FlowPointHandler(this);
        this.branchingHandler = new FlowBranchingHandler(this);
        this.managementHandler = new FlowManagementHandler(this);
        this.searchHandler = new FlowSearchHandler(this);


    }

    public get svg(): SVGSVGElement {
        return this.view.svg;
    }

    public get svgGroups(): Map<number, SVGGElement> {
        return this.view.svgGroups;
    }

    public static async create(p: Point, nodeId: string): Promise<Flow> {
        this.root.counters.flows++;
        const defaultName = "Flow " + this.root.counters.flows;
        const data: SyncedFlowData = {
            defaultName: defaultName,
            flowBranches: [{
                flowEntries: [{startNodeId: nodeId, endNodeId: nodeId, points: [p.object]}],
                childBranches: []
            }],
            flowTags: [{
                nodeId: nodeId,
                namedPaths: [{
                    name: defaultName,
                    index: 1,
                    branchIndices: [0]
                }]
            }]
        };

        const id = await super.createInObject(data, this.root.flows);
        //TODO MIGHT CAUSE ERROR DEPENDING ON EXEC TIME (IF CALLBACKS FIRED LATER) -- TO CHECK
        return this.root.flows[id].getBoundObjectOfType(Flow);
    }

    public static getAll(): Flow[] {
        return this.root.flows.getAllChildren().flatMap(flowData => flowData.getBoundObjectsOfType(Flow));
    }

    public static getDataById(id: string): SyncedFlow {
        return this.root.flows[id];
    }

    public static getById(id: string): Flow {
        return this.getDataById(id).getBoundObjectOfType(Flow);
    }

    protected setupCallbacks() {
        // this.data.flowTags.bind(YProxyEventName.entryChanged,
        //     (newValue: SyncedFlowTag, oldValue: SyncedFlowTag, _isLocal, path: YPath) => {
        //         if (!newValue && !oldValue) return;
        //
        //         const key = path[path.length - 1];
        //         const index = typeof key == "number" ? key : Number.parseInt(key);
        //
        //         if (!newValue) {
        //             this.flowTagsElements[index]?.destroy();
        //             this.flowTagsElements.splice(index, 1);
        //         } else if (!oldValue) {
        //             const flowTag = new FlowTag(this, newValue);
        //             this.flowTagsElements.splice(index, 0, flowTag);
        //         } else {
        //             const flowTag = this.flowTagsElements[index];
        //             if (flowTag) flowTag.data = newValue;
        //         }
        //     }, this);
    }

    public get flowBranches(): YArray<SyncedFlowBranch> {
        return this.data.flowBranches;
    }

    public get currentBranch(): SyncedFlowBranch {
        return this.data.flowBranches[this.currentBranchIndex];
    }
}
