import {define, TurboSelectEntry} from "turbodombuilder";
import {ProjectEntryView} from "./projectEntry.view";
import {ProjectEntryModel} from "./projectEntry.model";
import {ProjectEntryProperties} from "./projectEntry.types";
import {ObjectId} from "mongodb";
import "./projectEntry.css";
import {Home} from "../../screens/home/home";
import {App} from "../../directors/app/app";

@define()
export class ProjectEntry extends TurboSelectEntry<string, ObjectId, "p", ProjectEntryView, ProjectEntryProperties, ProjectEntryModel> {
    public director: App;

    public constructor(properties: ProjectEntryProperties) {
        super({
            secondaryValue: properties.projectId,
            value: properties.title
        });

        this.director = properties.director;
        this.mvc.generate({
            viewConstructor: ProjectEntryView,
            modelConstructor: ProjectEntryModel,
        });

        this.model.projectId = properties.projectId;
        this.model.lastOpened = properties.lastOpened;
    }

    public openProject() {
        window.location.href = `${window.location.origin}/project/${this.model.projectId}`;
    }
}