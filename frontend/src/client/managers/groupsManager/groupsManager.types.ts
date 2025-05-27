import {ObjectId} from "mongodb";

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

export type Project = {
    _id: ObjectId,
    name: string,
    groupId: ObjectId,
    createdAt: Date
};