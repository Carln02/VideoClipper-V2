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
import {FlowIntersectionHandler} from "./flow.intersectionHandler";
import {YMap} from "../../../../yManagement/yManagement.types";
import {YUtilities} from "../../../../yManagement/yUtilities";
import {FlowTag} from "../flowTag/flowTag";

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
            handlerConstructors: [FlowBranchesHandler, FlowSearchHandler, FlowCleaningHandler, FlowIntersectionHandler],
            data: properties.data,
            initialize: false
        });

        this.model.onFlowBranchAdded = (data) => new FlowBranch({flow: this, data: data});
        this.model.onFlowTagAdded = (data) => new FlowTag({flow: this, data: data, screenManager: this.screenManager});
        this.mvc.initialize();
    }

    public static createData(data?: SyncedFlow): YMap & SyncedFlow {
        if (!data) data = {};
        if (!data.branches) data.branches = {"0": undefined};
        if (!data.tags) data.tags = [undefined];
        if (!data.defaultName) data.defaultName = "Flow";

        Object.entries(data.branches).forEach(([key, branch]) => data.branches[key] = FlowBranch.createData(branch));
        data.branches = YUtilities.createYMap(data.branches);
        data.tags = YUtilities.createYArray(data.tags.map(tag => FlowTag.createData(tag)));

        return YUtilities.createYMap(data);
    }

    public get svg(): SVGSVGElement {
        return this.view.svg;
    }

    public get branches(): FlowBranch[] {
        return this.model.branches;
    }

    public get currentBranch(): FlowBranch {
        return this.model.currentBranch;
    }

    public get currentBranchData(): SyncedFlowBranch {
        return this.currentBranch.data;
    }

    public getBranchById(id: string): FlowBranch {
        return this.model.branchHandler.getBranchById(id);
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
        this.model.currentBranch?.addPoint(p, nodeId, isTemporary);
        this.mvc.emitter.fire("__redraw");
    }

    public async branchAtPoint(p: FlowPoint, branchPosition?: Point, nodeId?: string,
                         createThirdBranch: boolean = true, isOverwritingSibling: boolean = false) {
        return await this.model.branchHandler.branchAtPoint(p, branchPosition, nodeId, createThirdBranch, isOverwritingSibling);
    }

    public endFlow() {
        this.model.cleaningHandler.endFlow();
    }

    public updateOnDetachingNode(nodeId: string) {
        this.model.branches.forEach(branch => branch.updateOnDetachingNode(nodeId));
        this.model.cleaningHandler.removeUnnecessaryBranchesOrFlow();
    }

    public getPathsFromNode(nodeId: string): string[][] {
        return this.model.branchHandler.getPathsFromNode(nodeId);
    }
}
