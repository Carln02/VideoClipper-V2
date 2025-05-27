import {Collection, ObjectId} from "mongodb";
import {Group} from "./group";
import {GroupRole} from "./group.types";
import {AppRepositories} from "../app/app.repositories";

export class GroupRepository {
    public constructor(private collection: Collection<Group>, private repos: AppRepositories) {}

    public async getGroupsForUser(userId: ObjectId): Promise<Group[]> {
        return this.collection.find({"members.userId": userId}).toArray();
    }

    public async getGroup(id: ObjectId): Promise<Group | null> {
        return this.collection.findOne({_id: id});
    }

    public async createGroup(name: string, ownerId: ObjectId): Promise<Group> {
        const group = new Group(new ObjectId(), name, ownerId, [{userId: ownerId, role: "owner"}]);
        await this.collection.insertOne(group);
        return group;
    }

    public async addMember(groupId: ObjectId, userId: ObjectId, role: GroupRole): Promise<void> {
        await this.collection.updateOne(
            {_id: groupId},
            {$push: {members: {userId, role}}}
        );
    }

    public async removeMember(groupId: ObjectId, userId: ObjectId): Promise<void> {
        await this.collection.updateOne(
            {_id: groupId},
            {$pull: {members: {userId}}}
        );
    }

    public async userHasAccessToGroup(userId: ObjectId, groupId: ObjectId): Promise<boolean> {
        const group = await this.getGroup(groupId);
        return !!group?.members?.some(m => m.userId.equals(userId));
    }
}