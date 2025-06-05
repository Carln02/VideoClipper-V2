import { TurboModel } from "turbodombuilder";
import { FlowColorSelector } from "./flowColorSelector";

export class FlowColorSelectorModel extends TurboModel {
    public colors: string[] = ["#439045", "#e36060", "#607fe3", "#d1c948", "#9e42f5", "#42f5e6"];
    public selectedColor: string;

    constructor(data?: any) {
        super(data);
        this.selectedColor = this.colors[0]; // Default color
    }
}


