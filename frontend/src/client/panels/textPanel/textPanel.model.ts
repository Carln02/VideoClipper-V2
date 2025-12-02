import {Coordinate, modelSignal, TurboModel, TurboYBlock} from "turbodombuilder";

export class TextPanelModel extends TurboModel {
    public dataBlockConstructor = TurboYBlock;
    @modelSignal() public origin: Coordinate;
    @modelSignal() public fontSize: number;
}