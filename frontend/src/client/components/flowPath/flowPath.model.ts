import {SyncedFlowPath} from "./flowPath.types";
import {Flow} from "../flow/flow";
import {SyncedFlowEntry} from "../flowEntry/flowEntry.types";
import {MvcBlockKeyType, TurboModel, TurboYBlock, YArray, YMap} from "turbodombuilder";

export class FlowPathModel extends TurboModel {

    public dataBlockConstructor = TurboYBlock;
    protected entriesModel: YManagerModel<SyncedFlowEntry, void, number, YArray, string, "array">;

    public flow: Flow;

    public constructor(data?: SyncedFlowPath & YMap) {
        super(data);
        this.entriesModel = new YManagerModel();
    }

    public initialize(blockKey: MvcBlockKeyType<"map"> = this.defaultBlockKey) {
        super.initialize(blockKey);
    }

    public get name(): string {
        return this.getData("name");
    }

    public set name(value: string) {
        this.setData("name", value);
    }

    public get index(): number {
        return this.getData("index");
    }

    public set index(value: number) {
        this.setData("index", value);
    }

    public get nodeIds(): YArray<string> {
        return this.getData("nodeIds");
    }

    public get nodeIdsArray(): string[] {
        return this.nodeIds?.toJSON() || [];
    }
}