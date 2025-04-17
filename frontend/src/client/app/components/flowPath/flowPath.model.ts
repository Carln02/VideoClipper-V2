import {YArray} from "../../../../yManagement/yManagement.types";
import {YComponentModel} from "../../../../yManagement/yModel/types/yComponentModel";

export class FlowPathModel extends YComponentModel {
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
        return this.branchIds.toArray();
    }

    public insertBranchAt(branchId: string, index?: number) {
        if (index == undefined || index >= this.branchIdsArray.length) return this.branchIds.push([branchId]);
        if (index < 0) index = 0;
        this.branchIds.insert(index, [branchId]);
    }
}