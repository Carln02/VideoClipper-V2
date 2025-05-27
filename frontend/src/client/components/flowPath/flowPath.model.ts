import {YArray, YMap} from "../../../yManagement/yManagement.types";
import {YComponentModel} from "../../../yManagement/yModel/types/yComponentModel";
import {YManagerModel} from "../../../yManagement/yModel/types/yManagerModel";
import {SyncedFlowPath} from "./flowPath.types";
import {Flow} from "../flow/flow";
import {SyncedFlowEntry} from "../flowEntry/flowEntry.types";
import {FlowPathEntryCardHandler} from "./flowPath.entryCardHandler";
import {MvcBlockKeyType} from "turbodombuilder";

export class FlowPathModel extends YComponentModel {
    protected branchIdsModel: YManagerModel<string, void, number, YArray>;
    protected entriesModel: YManagerModel<SyncedFlowEntry, void, number, YArray, string, "array">;

    public flow: Flow;

    public constructor(data?: SyncedFlowPath & YMap) {
        super(data);
        this.branchIdsModel = new YManagerModel();
        this.entriesModel = new YManagerModel();

        this.branchIdsModel.onAdded = (branchId, branchIndex) =>
            this.entriesModel.setBlock(this.flow.getBranchById(branchId)?.entriesData, branchId, branchIndex);

        this.entriesModel.onAdded = () => this.entryCardHandler?.updateCardsModel(this.entriesModel);
        this.entriesModel.onDeleted = () => this.entryCardHandler?.updateCardsModel(this.entriesModel);
    }

    public initialize(blockKey: MvcBlockKeyType<"map"> = this.defaultBlockKey) {
        super.initialize(blockKey);
        if (blockKey === this.defaultBlockKey) this.branchIdsModel.data = this.branchIds;
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

    public get branchIds(): YArray<string> {
        return this.getData("branchIds");
    }

    public set branchIds(value: YArray<string>) {
        this.setData("branchIds", value);
    }

    public get branchIdsArray(): string[] {
        return this.branchIds?.toArray();
    }

    public get cardIds(): YArray<string> {
        return this.getData("cardIds");
    }

    public get cardIdsArray(): string[] {
        return this.cardIds.toJSON();
    }

    public insertBranchAt(branchId: string, index?: number) {
        if (index == undefined || index >= this.branchIdsArray.length) return this.branchIds.push([branchId]);
        if (index < 0) index = 0;
        this.branchIds.insert(index, [branchId]);
    }

    public get entryCardHandler(): FlowPathEntryCardHandler {
        return this.getHandler("entryCard") as FlowPathEntryCardHandler;
    }
}