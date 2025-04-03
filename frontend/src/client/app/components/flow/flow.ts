import {define, Point} from "turbodombuilder";
import "./flow.css";
import {FlowPoint, SyncedFlow} from "./flow.types";
import {FlowView} from "./flow.view";
import {FlowModel} from "./flow.model";
import {SyncedFlowBranch} from "../flowBranch/flowBranch.types";
import {FlowBranchesHandler} from "./flow.branchesHandler";
import {FlowSearchHandler} from "./flow.searchHandler";
import {FlowBranch} from "../flowBranch/flowBranch";
import {FlowCleaningHandler} from "./flow.cleaningHandler";
import {VcComponent} from "../component/component";
import {VcComponentProperties} from "../component/component.types";
import {DocumentManager} from "../../managers/documentManager/documentManager";

/**
 * @description A reactiveComponent that represents a flow connecting cards
 */
@define("vc-flow")
export class Flow extends VcComponent<FlowView, SyncedFlow, FlowModel, DocumentManager> {
    public constructor(properties: VcComponentProperties<FlowView, SyncedFlow, FlowModel, DocumentManager> = {}) {
        super(properties);
        this.mvc.generate({
            viewConstructor: FlowView,
            modelConstructor: FlowModel,
            handlerConstructors: [FlowBranchesHandler, FlowSearchHandler, FlowCleaningHandler],
            data: properties.data,
            initialize: false
        });

        this.model.onFlowBranchAdded = (data) => new FlowBranch({flow: this, data: data});
        this.mvc.initialize();
    }

    public get svg(): SVGSVGElement {
        return this.view.svg;
    }

    // public static async create(p: Point, nodeId: string): Promise<Flow> {
    //     this.root.counters.flows++;
    //     const defaultName = "Flow " + this.root.counters.flows;
    //     const data: SyncedFlowData = {
    //         defaultName: defaultName,
    //         flowBranches: [{
    //             flowEntries: [{startNodeId: nodeId, endNodeId: nodeId, points: [p.object]}],
    //             childBranches: []
    //         }],
    //         flowTags: [{
    //             nodeId: nodeId,
    //             namedPaths: [{
    //                 name: defaultName,
    //                 index: 1,
    //                 branchIndices: [0]
    //             }]
    //         }]
    //     };
    //
    //     const id = await super.createInObject(data, this.root.flows);
    //     //TODO MIGHT CAUSE ERROR DEPENDING ON EXEC TIME (IF CALLBACKS FIRED LATER) -- TO CHECK
    //     return this.root.flows[id].getBoundObjectOfType(Flow);
    // }

    public static getAll(): Flow[] {
        return this.root.flows.getAllChildren().flatMap(flowData => flowData.getBoundObjectsOfType(Flow));
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

    public get branches(): FlowBranch[] {
        return this.model.branches;
    }

    public get currentBranch(): SyncedFlowBranch {
        return this.model.currentBranch.data;
    }

    /**
     * @description Finds the last flow entry inside the given node's ID
     * @param nodeId
     */
    public findNodeEntry(nodeId: string): FlowPoint {
        return this.model.searchHandler.findNodeEntry(nodeId);
    }

    /**
     * @description Finds the last flow entry inside the given node's ID
     * @param nodeId
     */
    public findNodeEntries(nodeId: string): FlowPoint[] {
        return this.model.searchHandler.findNodeEntries(nodeId);
    }

    /**
     * @description Finds the closest point in the flow to the given point
     * @param point
     */
    public findClosestPoint(point: Point): FlowPoint {
        return this.model.searchHandler.findClosestPoint(point);
    }

    /**
     * @description Adds the provided point to the flow with the given ID. The node ID indicates the ID of the node
     * the point is in (or null), and isTemporary indicates whether the point is temporarily added to the flow as
     * part of user feedback (to not add it to the synced data).
     * @param p
     * @param nodeId
     * @param isTemporary
     */
    public addPoint(p: Point, nodeId?: string, isTemporary: boolean = false) {
        this.model.currentBranch.addPoint(p, nodeId, isTemporary);
    }

    public endFlow() {
        this.model.cleaningHandler.endFlow();
    }
}
