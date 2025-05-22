import {YDoc} from "../../../../yManagement/yManagement.types";
import {RequestManager} from "../requestManager/requestManager";
import {Group, Project} from "./groupsManager.types";
import {WebsocketManager} from "../websocketManager/websocketManager";
import {ObjectId} from "mongodb";
import {Delegate} from "turbodombuilder";

export class GroupManager extends RequestManager {
    private _groups: Group[] = [];
    public readonly onGroupsChanged: Delegate<(groups: Group[]) => void> = new Delegate();

    public async loadGroups(userId: ObjectId): Promise<void> {
        const res = await fetch(`${this.serverUrl}api/groups?userId=${userId}`, {credentials: "include"});
        if (!res.ok) throw new Error("Failed to load groups");
        this._groups = await res.json();
        this.onGroupsChanged.fire(this.groups);
    }

    public get groups(): Group[] {
        return this._groups;
    }

    public async getProjectsForGroup(groupId: ObjectId): Promise<Project[]> {
        const res = await fetch(`${this.serverUrl}api/projects?groupId=${groupId}`, {credentials: "include",});
        if (!res.ok) throw new Error("Failed to load projects for group");
        return await res.json();
    }

    public async openProject(projectId: ObjectId): Promise<YDoc | null> {
        const res = await fetch(`${this.serverUrl}api/projects/${projectId}`, {credentials: "include"});

        if (!res.ok) {
            if (res.status === 403) throw new Error("Access denied");
            if (res.status === 404) throw new Error("Project not found");
            throw new Error("Unknown error");
        }

        const project = await res.json();

        const doc = new YDoc();
        new WebsocketManager(project.yjsRoomId, doc);
        return doc;
    }
}