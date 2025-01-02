import {YComponentModel} from "../../../../../../yManagement/yMvc/yModel/types/yComponentModel";
import {Coordinate} from "turbodombuilder";

export class TextSidePanelModel extends YComponentModel {
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