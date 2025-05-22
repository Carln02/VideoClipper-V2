import { ObjectId } from "mongodb";
import {GroupMember} from "./group.types";

export class Group {
    _id: ObjectId;
    name: string;
    ownerId: ObjectId;
    members: GroupMember[];
    createdAt: Date;

    public constructor(_id: ObjectId, name: string, ownerId: ObjectId, members: GroupMember[] = []) {
        this._id = _id;
        this.name = name;
        this.ownerId = ownerId;
        this.members = members;
        this.createdAt = new Date();
    }
}
