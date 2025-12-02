import {ObjectId} from "mongodb";
import {WebsocketManager} from "../../managers/websocketManager/websocketManager";
import {YDoc} from "turbodombuilder";

export type Group = {
    _id: ObjectId,
    name: string,
    ownerId: ObjectId,
    members: GroupMember[],
    createdAt: Date
};

export type GroupMember = {
    userId: ObjectId,
    role: GroupRole
};

export type GroupRole = "owner" | "editor" | "viewer";

export type ProjectData = {
    _id: ObjectId,
    name: string,
    groupId: ObjectId,
    createdAt: Date
};

export type PersistedDoc = {
    doc: YDoc,
    websocket: WebsocketManager
};