import {ObjectId} from "mongodb";

export class User {
    _id: ObjectId;
    email: string;
    name?: string;

    public constructor(_id: ObjectId, email: string, name?: string) {
        this._id = _id;
        this.email = email;
        this.name = name;
    }
}