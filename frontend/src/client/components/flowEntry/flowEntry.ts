import {YMap} from "../../../yManagement/yManagement.types";
import {YUtilities} from "../../../yManagement/yUtilities";
import {FlowEntryProperties, SyncedFlowEntry} from "./flowEntry.types";
import {FlowEntryModel} from "./flowEntry.model";
import {Coordinate, Point, SvgNamespace, TurboProxiedElement} from "turbodombuilder";
import {FlowEntryView} from "./flowEntry.view";
import {FlowIntersection} from "../flow/flow.types";
import {FlowEntryIntersectionController} from "./flowEntry.intersectionController";
import {FlowEntryPointController} from "./flowEntry.pointController";
import {Project} from "../../directors/project/project";
import {FlowEntryUpdateController} from "./flowEntry.updateController";

export class FlowEntry extends TurboProxiedElement<"g", FlowEntryView, SyncedFlowEntry & YMap, FlowEntryModel> {
    public director: Project;
    public constructor(properties: FlowEntryProperties) {
        super({tag: "g", namespace: SvgNamespace});
        this.director = properties.director;
        this.mvc.generate({
            viewConstructor: FlowEntryView,
            modelConstructor: FlowEntryModel,
            data: properties.data,
            controllerConstructors: [FlowEntryIntersectionController, FlowEntryPointController, FlowEntryUpdateController],
            initialize: false
        });

        this.model.flow = properties.flow;
        this.model.flow?.svg.addChild(this.element);

        this.mvc.initialize();
    }

    public static createData(data?: SyncedFlowEntry): YMap & SyncedFlowEntry {
        if (data instanceof YMap) return data;
        if (!data) data = {};
        if (!data.startNodeId) data.startNodeId = "";
        if (!data.endNodeId) data.endNodeId = "";
        if (!data.points) data.points = [];
        return YUtilities.createYMap(data);
    }

    public updateAfterMovingNode(nodeId: string, deltaPosition: Point) {
        return this.updateController.updateAfterMovingNode(nodeId, deltaPosition);
    }

    public get startNodeId(): string {
        return this.model.startNodeId;
    }

    public set startNodeId(value: string) {
        this.model.startNodeId = value;
    }

    public get endNodeId(): string {
        return this.model.endNodeId;
    }

    public set endNodeId(value: string) {
        this.model.endNodeId = value;
    }

    public get points(): Point[] {
        return this.pointController.points;
    }

    public addPoint(point: Point, isTemporary: boolean = false) {
        return this.pointController.addPoint(point, isTemporary);
    }

    public removePoint(index: number) {
        return this.pointController.removePoint(index);
    }

    public incrementPoint(index: number, increment: Coordinate) {
        return this.pointController.incrementPoint(index, increment);
    }

    public getMaxPoint(): Point {
        return this.pointController.getMaxPoint();
    }

    public intersectsPoint(point: Point, errorMargin: number = 50, incrementValue: number = 1): boolean {
        return this.intersectionController.intersectsPoint(point, errorMargin, incrementValue);
    }

    public intersectsArea(topLeft: Point, size: Point): boolean {
        return this.intersectionController.intersectsArea(topLeft, size);
    }

    public closestPointOnPath(p: Point, closestPoint: FlowIntersection, errorMargin: number = 50, incrementValue: number = 10): FlowIntersection {
        return this.intersectionController.closestPointOnPath(p, closestPoint, errorMargin, incrementValue);
    }

    public get flow(){
        return this.model.flow;
    }

    protected get pointController(): FlowEntryPointController {
        return this.mvc.getController("point") as FlowEntryPointController;
    }

    protected get intersectionController(): FlowEntryIntersectionController {
        return this.mvc.getController("intersection") as FlowEntryIntersectionController;
    }

    protected get updateController(): FlowEntryUpdateController {
        return this.mvc.getController("update") as FlowEntryUpdateController;
    }

    public redraw(){
        this.view.redraw(true);
    }

    public delete() {
        this.view.clearDrawing();
        this.model.flow.removeEntry(this);
    }

    public endEntry(endNodeId?: string) {
        if (endNodeId) this.endNodeId = endNodeId;
        if (!this.endNodeId) return this.delete();
        if (this.model.temporaryPoint) this.addPoint(this.model.temporaryPoint, false);
    }
}