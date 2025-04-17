import {define} from "turbodombuilder";
import "./flowTag.css";
import {BranchingNode} from "../branchingNode/branchingNode";
import {Flow} from "../flow/flow";
import {FlowTagProperties, SyncedFlowTag} from "./flowTag.types";
import {VcComponent} from "../component/component";
import {FlowTagModel} from "./flowTag.model";
import {FlowTagView} from "./flowTag.view";
import {DocumentManager} from "../../managers/documentManager/documentManager";
import {YArray, YMap} from "../../../../yManagement/yManagement.types";
import {SyncedFlowPath} from "../flowPath/flowPath.types";
import {FlowPathModel} from "../flowPath/flowPath.model";
import {FlowPath} from "../flowPath/flowPath";
import {YUtilities} from "../../../../yManagement/yUtilities";

@define("vc-flow-tag")
export class FlowTag extends VcComponent<FlowTagView, SyncedFlowTag, FlowTagModel, DocumentManager> {
    private readonly flow: Flow;

    public constructor(properties: FlowTagProperties) {
        super(properties);
        this.flow = properties.flow;
        this.mvc.generate({
            viewConstructor: FlowTagView,
            modelConstructor: FlowTagModel,
        });
    }

    public static createData(data?: SyncedFlowTag): YMap & SyncedFlowTag {
        if (!data) data = {};
        if (!data.nodeId) data.nodeId = "";
        if (!data.paths) data.paths = [undefined];
        data.paths = YUtilities.createYArray(data.paths.map(path => FlowPath.createData(path)));
       return YUtilities.createYMap<SyncedFlowTag>(data);
    }

    public get attachedNode(): BranchingNode {
        console.log(this.model.nodeId);
        return this.screenManager.getNode(this.model.nodeId);
    }

    public get paths(): YArray<SyncedFlowPath & YMap> {
        return this.model.paths;
    }

    public get pathsArray(): (SyncedFlowPath & YMap)[] {
        return this.model.pathsArray;
    }

    public insertPath(pathData: YMap | SyncedFlowPath, index?: number) {
        return this.model.insertPath(pathData, index);
    }

    public regeneratePaths(updateWheel: boolean = true) {
        const paths = this.flow.getPathsFromNode(this.model.nodeId);
        if (!this.model.paths) this.model.paths = new YArray();

        const oldPaths = this.model.pathsArray;
        // const sortedNamedPaths: SyncedFlowPath[] = this.model.pathsArray
        //     .sort((p1, p2) => p2.branchIndices.length - p1.branchIndices.length);

        const newPaths = [];
        paths.forEach(path => newPaths.push(this.getName(path, sortedNamedPaths)));
        this.data.namedPaths = newNamedPaths;
        if (updateWheel) {
            const selectedValue = this.wheel.selectedValue;
            this.wheel.values = this.generateWheelEntries();
            this.wheel.select(selectedValue);
        }
    }

    private getName(path: string[], namedPaths: SyncedFlowPath[]): SyncedFlowPath {
        for (const namedPath of namedPaths) {
            const oldPath = new FlowPathModel(namedPath);
            if (oldPath.branchIdsArray.length > path.length) continue;
            let skip = false;
            for (let i = 0; i < namedPath.branchIds.length; i++) {
                if (namedPath.branchIds[i] != path[i]) {
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