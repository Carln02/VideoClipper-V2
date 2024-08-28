import {define, Direction, TurboSelectEntry, TurboSelectWheel} from "turbodombuilder";
import "./flowTag.css";
import {NamedFlowPath, SyncedFlowTag} from "../flow/flow.types";
import {BranchingNode} from "../branchingNode/branchingNode";
import {Flow} from "../flow/flow";
import {SyncedComponent} from "../../abstract/syncedComponent/syncedComponent";

@define("vc-flow-tag")
export class FlowTag extends SyncedComponent<SyncedFlowTag> {
    private readonly flow: Flow;

    private readonly wheel: TurboSelectWheel;

    constructor(flow: Flow, data: SyncedFlowTag) {
        super();
        this.flow = flow;

        this.data = data;
        this.attachedNode.addChild(this);
        this.regeneratePaths(false);

        this.wheel = new TurboSelectWheel({
            parent: this,
            values: this.generateWheelEntries(),
            direction: Direction.vertical,
        }).setStyle("margin", 0);
    }

    private get attachedNode(): BranchingNode {
        return BranchingNode.getById(this.data.nodeId);
    }

    private generateWheelEntries() {
        return this.data.namedPaths.map(path => {
            return new TurboSelectEntry({
                value: path.name + (path.index < 2 ? "" : " - " + path.index),
                style: "padding: 6px; white-space: nowrap;",
                onSelected: (b: boolean) => {
                    if (!b) return;
                    this.flow.drawingHandler.highlightBranches(path.branchIndices);
                }
            });
        });
    }

    public regeneratePaths(updateWheel: boolean = true) {
        const paths = this.flow.managementHandler.getPathsFromNode(this.data.nodeId);
        if (!this.data.namedPaths) this.data.namedPaths = [];

        const sortedNamedPaths: NamedFlowPath[] = this.data.namedPaths
            .sort((p1, p2) => p2.branchIndices.length - p1.branchIndices.length);

        const newNamedPaths: NamedFlowPath[] = [];
        paths.forEach(path => newNamedPaths.push(this.getName(path, sortedNamedPaths)));
        this.data.namedPaths = newNamedPaths;
        if (updateWheel) {
            const selectedValue = this.wheel.selectedValue;
            this.wheel.values = this.generateWheelEntries();
            this.wheel.select(selectedValue);
        }
    }

    private getName(path: number[], namedPaths: NamedFlowPath[]): NamedFlowPath {
        for (const namedPath of namedPaths) {
            if (namedPath.branchIndices.length > path.length) continue;
            let skip = false;
            for (let i = 0; i < namedPath.branchIndices.length; i++) {
                if (namedPath.branchIndices[i] != path[i]) {
                    skip = false;
                    break;
                }
            }
            if (!skip) return {
                name: namedPath.name,
                index: namedPath.branchIndices.length == path.length
                    ? namedPath.index
                    : this.getNextIndexByName(namedPaths, namedPath.name),
                branchIndices: path
            };
        }
        return {
            name: this.flow.data.defaultName,
            index: this.getNextIndexByName(namedPaths, this.flow.data.defaultName),
            branchIndices: path
        };
    }

    private getNextIndexByName(namedPaths: NamedFlowPath[], name: string): number {
        let nextIndex = 1;
        namedPaths.forEach(namedPath => {
            if (namedPath.name != name) return;
            if (nextIndex > namedPath.index) return;
            nextIndex = namedPath.index + 1;
        });
        return nextIndex;
    }
}