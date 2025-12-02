import {ObjectId} from "mongodb";
import {App} from "../../directors/app/app";
import {VcProperties} from "../component/component.types";
import {ProjectEntryView} from "./projectEntry.view";
import {ProjectEntryModel} from "./projectEntry.model";

export type ProjectEntryProperties = VcProperties<ProjectEntryView, ProjectEntryData, ProjectEntryModel, App>;

export type ProjectEntryData = {
    projectName: string,
    projectId?: ObjectId,
    lastOpened?: Date,
    createdOn?: Date,
}