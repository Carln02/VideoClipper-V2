import { ObjectId } from "mongodb";

export class Project {
    _id: ObjectId;
    name: string;
    groupId: ObjectId;
    createdAt: Date;

    public constructor(_id: ObjectId, name: string, groupId: ObjectId) {
        this._id = _id;
        this.name = name;
        this.groupId = groupId;
        this.createdAt = new Date();
    }
}