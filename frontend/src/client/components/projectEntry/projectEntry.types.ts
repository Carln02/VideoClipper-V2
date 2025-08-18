import {ObjectId} from "mongodb";
import {App} from "../../directors/app/app";

export type ProjectEntryProperties = {
    director?: App,
    projectId?: ObjectId,
    title?: string,
    lastOpened?: Date,
    createdOn?: Date,
}