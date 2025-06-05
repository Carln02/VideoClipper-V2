import { TurboPopupProperties } from "turbodombuilder";
import { FlowColorSelectorModel } from "./flowColorSelector.model";
import { FlowColorSelectorView } from "./flowColorSelector.view";
import { ConnectionTool } from "../../tools/connection/connection";
import { VcComponent } from "../component/component";
import { VcComponentProperties } from "../component/component.types";

export type FlowColorSelectorProperties = VcComponentProperties<FlowColorSelectorView, any, FlowColorSelectorModel> & {
    connectionTool: ConnectionTool;
    initialColor?: string;
    onColorSelected?: (color: string) => void;
}