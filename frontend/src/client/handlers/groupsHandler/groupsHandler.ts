import {RequestHandler} from "../requestHandler/requestHandler";
import {ObjectId} from "mongodb";
import {Delegate, YDoc} from "turbodombuilder";
import {Group, PersistedDoc, ProjectData} from "./groupsHandler.types";
import {WebsocketManager} from "../../managers/websocketManager/websocketManager";

export class GroupsHandler extends RequestHandler {
    private _groups: Group[] = [];
    public readonly onGroupsChanged: Delegate<(groups: Group[]) => void> = new Delegate();

    private readonly docs = new Map<string, YDoc>();

    private getOrCreateYDoc(id: ObjectId): YDoc {
        const str = id.toString();
        if (!this.docs.has(str)) this.docs.set(str, new YDoc());
        return this.docs.get(str)!;
    }

    public async loadGroups(userId: ObjectId): Promise<void> {
        const res = await fetch(`${this.serverUrl}api/groups?userId=${userId}`, {credentials: "include"});
        if (!res.ok) throw new Error("Failed to load groups");
        this._groups = await res.json();
        this.onGroupsChanged.fire(this.groups);
    }

    public get groups(): Group[] {
        return this._groups;
    }

    public async getProjectsForGroup(groupId: ObjectId): Promise<ProjectData[]> {
        if (!groupId) {
            const arr: ProjectData[] = [];
            for (const group of this.groups) arr.push(...(await this.getProjectsForGroup(group._id)));
            return arr;
        }

        const res = await fetch(`${this.serverUrl}api/projects?groupId=${groupId}`, {credentials: "include",});
        if (!res.ok) throw new Error("Failed to load projects for group");
        return await res.json();
    }

    public async createGroup(groupName: string): Promise<Group> {
        const res = await fetch(`${this.serverUrl}api/groups`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            credentials: "include",
            body: JSON.stringify({name: groupName}),
        });

        if (!res.ok) throw new Error("Failed to create group");
        return await res.json();
    }

    public async addGroupMember(email: string, groupId: ObjectId): Promise<boolean> {
        const res = await fetch(`${this.serverUrl}api/groups/add-member`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            credentials: "include",
            body: JSON.stringify({email: email, groupId: groupId}),
        });

        return res.ok;
    }

    public async createProject(projectName: string, groupId: ObjectId): Promise<ProjectData> {
        const res = await fetch(`${this.serverUrl}api/projects`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            credentials: "include",
            body: JSON.stringify({name: projectName, groupId}),
        });

        if (!res.ok) throw new Error("Failed to create project");
        return await res.json();
    }

    public async openProject(projectId: ObjectId): Promise<PersistedDoc | null> {
        const res = await fetch(`${this.serverUrl}api/projects/${projectId}`, {credentials: "include"});

        if (!res.ok) {
            if (res.status === 403) throw new Error("Access denied");
            if (res.status === 404) throw new Error("Project not found");
            throw new Error("Unknown error");
        }

        const project = await res.json();

        const doc = this.getOrCreateYDoc(project._id);
        return {doc: doc, websocket: new WebsocketManager(`PROJECT:${project._id}`, doc)};
    }

    public async deleteProject(projectId: ObjectId): Promise<void> {
        const res = await fetch(`${this.serverUrl}api/projects/${projectId}`, {
            method: "DELETE",
            credentials: "include",
        });

        if (!res.ok) {
            if (res.status === 403) throw new Error("Access denied");
            if (res.status === 404) throw new Error("Project not found");
            throw new Error("Unknown error");
        }

        this.docs.delete(projectId.toString());
    }
}