import {auto, TurboModel} from "turbodombuilder";
import {ObjectId} from "mongodb";

export class ProjectEntryModel extends TurboModel {
    public projectId: ObjectId;

    @auto()
    public set lastOpened(value: Date) {
        this.fireCallback("lastOpened", value);
    }
}