import {TextType} from "./textElement.types";
import {Coordinate, modelSignal, TurboModel, TurboYBlock} from "turbodombuilder";

export class TextElementModel extends TurboModel {
    public static dataBlockConstructor = TurboYBlock;
    @modelSignal() public type: TextType;
    @modelSignal() public text: string;
    @modelSignal() public origin: Coordinate;
    @modelSignal() public fontSize: number;
    @modelSignal() public boxWidth: number;
    @modelSignal() public boxHeight: number;
}