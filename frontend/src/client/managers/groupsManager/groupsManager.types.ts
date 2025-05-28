import {ObjectId} from "mongodb";
import { YDoc } from "../../../yManagement/yManagement.types";
import {WebsocketManager} from "../websocketManager/websocketManager";

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