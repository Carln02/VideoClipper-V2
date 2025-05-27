import {Coordinate} from "turbodombuilder";
import {YComponentModel} from "../../../yManagement/yModel/types/yComponentModel";

export class BranchingNodeModel extends YComponentModel {
    public get origin(): Coordinate {
        return this.getData("origin") as Coordinate;
    }

    public set origin(value: Coordinate) {
        this.setData("origin", value);
    }
}