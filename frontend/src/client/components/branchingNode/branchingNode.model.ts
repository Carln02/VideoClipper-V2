import {Coordinate, modelSignal, TurboModel, TurboYBlock} from "turbodombuilder";

export class BranchingNodeModel extends TurboModel {
    public static dataBlockConstructor = TurboYBlock;
    @modelSignal() public origin: Coordinate;
}