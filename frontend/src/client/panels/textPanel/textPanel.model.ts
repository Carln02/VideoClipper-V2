import {Coordinate} from "turbodombuilder";
import {YComponentModel} from "../../../yManagement/yModel/types/yComponentModel";

export class TextPanelModel extends YComponentModel {
    public get origin(): Coordinate {
        return this.getData("origin");
    }

    public set origin(value: Coordinate) {
        this.setData("origin", value);
    }

    public get fontSize(): number {
        return this.getData("fontSize");
    }

    public set fontSize(value: number) {
        this.setData("fontSize", value);
    }
}