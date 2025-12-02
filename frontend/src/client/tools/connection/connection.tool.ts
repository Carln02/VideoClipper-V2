import {turbo, TurboDragEvent, TurboEvent, TurboTool} from "turbodombuilder";
import {ToolType} from "../../directors/project/project.types";
import {getClosestPointOnEdge, pointInsideRect} from "../../utils/computation";
import {Connection} from "./connection";
import {ConnectionModel} from "./connection.model";
import {Playback} from "../../components/playback/playback";
import {BranchingNode} from "../../components/branchingNode/branchingNode";
import {Project} from "../../directors/project/project";

export class ConnectionTool extends TurboTool<Connection, any, ConnectionModel> {
    public toolName = ToolType.connection;

    public get target(): HTMLElement {
        return this.element.querySelector("vc-playback");
    }

    public onActivate() {
        this.emitter.fire("clearFlow");
    }

    //On click --> create a point if the click is inside a node, otherwise cancel flow
    public click(e: TurboEvent, target: Node) {
        if (target instanceof Playback) {
            const node = turbo(target).closest(BranchingNode);
            if (!node) return false;
            this.model.lastNodeId = node.dataId;
            //If no current flow --> try to initialize one
            if (!this.element.currentFlow) this.emitter.fire("initializeFlow", e);
            //Add a point to this flow, with the closestNode's ID
            else this.element.currentFlow.addPoint(e.scaledPosition);
            return true;
        } else if (target instanceof Project) {
            this.element.currentEntry?.endEntry();
            this.emitter.fire("clearFlow");
            return true;
        }
    }

    public move(e: TurboDragEvent, target: Node) {
        if (!(target instanceof Project)) return;
        this.element.currentFlow?.addPoint(e.scaledPosition, true);
        return true;
    }

    public dragStart(e: TurboDragEvent, target: Node) {
        if (target instanceof Playback) {
            const node = turbo(target).closest(BranchingNode);
            if (!node) return false;
            this.emitter.fire("clearFlow");
            //Return if already creating/editing a flow
            if (this.model.currentFlowId) return true;
            this.model.lastNodeId = node.dataId;
            this.emitter.fire("initializeFlow", e);
            return true;
        }
    }

    //On drag --> draw flow
    public drag(e: TurboDragEvent, target: Node) {
        if (target instanceof Playback) {
            const node = turbo(target).closest(BranchingNode);
            if (!node) return false;
            //Return if no current flow
            if (!this.element.currentFlow) return true;

            //TODO: PROBLEM FOR LATER FIX THIS STUPID THING
            const cardRect = this.target.getBoundingClientRect();
            if (!pointInsideRect(e.position, cardRect, 0)) return true;

            if (this.element.currentEntry) {
                if (this.element.currentEntry.startNodeId === this.model.dataId) return true;
                const lastPoint = getClosestPointOnEdge(e.position, cardRect);
                //TODO USE CONSTRAINTS INSTEAD
                this.element.currentEntry.addPoint(this.element.director.canvas.navigationManager.computePositionRelativeToCanvas(lastPoint));
                this.element.currentEntry.endEntry(this.model.dataId);
            }

            this.element.currentFlow.createEntry(this.model.dataId);

            // //Check if drawing a temporary or permanent point
            // //If drawing into a new node --> ignore interval and add a point. This ensures that when a user hits a
            // // new node, it is added to the flow
            // const isTemporary = Date.now() - tool.lastDrawnTime <= tool.drawingInterval
            //     && this.element.dataId == tool.lastNodeId;
            // //If the point is permanent --> update last drawn time and last node
            // if (!isTemporary) {
            //     tool.lastDrawnTime = Date.now();
            //     tool.lastNodeId = this.element.dataId;
            // }
            //
            // console.log(tool.lastNodeId);
            // //Add point
            // tool.currentFlow?.addPoint(e.scaledPosition, this.element.dataId, isTemporary);

            return true;
        } else if (target instanceof Project) {
            //Return if no current flow
            if (!this.element.currentFlow || !this.element.currentEntry) return;

            if (this.element.currentEntry.points.length < 2) {
                const lastNode = target.getNode(this.element.currentEntry.startNodeId);
                if (!lastNode) return;
                const firstPoint = getClosestPointOnEdge(e.position, turbo(lastNode).closest(Playback)?.getBoundingClientRect());
                //TODO USE CONSTRAINTS INSTEAD
                this.element.currentEntry.addPoint(target.canvas.navigationManager.computePositionRelativeToCanvas(firstPoint));
            }

            //Check if drawing a temporary or permanent point
            //If drawing into a new node --> ignore interval and add a point. This ensures that when a user hits a
            // new node, it is added to the flow
            const isTemporary = Date.now() - this.model.lastDrawnTime <= this.model.drawingInterval;
            //If the point is permanent --> update last drawn time and last node
            if (!isTemporary) {
                this.model.lastDrawnTime = Date.now();
                this.model.lastNodeId = null;
            }
            //Add point
            this.element.currentFlow?.addPoint(e.scaledPosition, isTemporary);
        }
    }

    public dragEnd(e: TurboEvent, target: Node) {
        if (target instanceof Project) {
            this.element.currentEntry?.endEntry();
            this.emitter.fire("clearFlow");
            return true;
        }
    }
}