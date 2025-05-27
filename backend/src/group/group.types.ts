import {ObjectId} from "mongodb";

export type GroupRole = "owner" | "editor" | "viewer";

export interface GroupMember {
    userId: ObjectId;
    role: GroupRole;
}