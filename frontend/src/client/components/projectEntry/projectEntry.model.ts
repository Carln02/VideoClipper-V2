import {modelSignal, TurboModel} from "turbodombuilder";
import {ObjectId} from "mongodb";

export class ProjectEntryModel extends TurboModel {
    @modelSignal() public projectId: ObjectId;
    @modelSignal() public lastOpened: Date;
    @modelSignal() public createdOn: Date;
    @modelSignal() public projectName: string;
}