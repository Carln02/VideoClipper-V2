import {ObjectId} from "mongodb";
import {GroupRepository} from "./group.repository";
import {respondFailure, respondSuccess} from "../utils/response";

export class GroupController {
    constructor(private groupRepo: GroupRepository) {}

    public getGroupsForUser = async (req: any, res: any) => {
        try {
            const userId = req.query.userId;
            if (!userId || !ObjectId.isValid(userId)) throw new Error("Invalid user ID");

            const groups = await this.groupRepo.getGroupsForUser(new ObjectId(userId));
            respondSuccess(res, groups);
        } catch (err: any) {
            respondFailure(res, err.message);
        }
    };

    public createGroup = async (req: any, res: any) => {
        try {
            const {name, ownerId} = req.body;
            if (!name || !ownerId) throw new Error("Group name and ownerId are required");
            const group = await this.groupRepo.createGroup(name, new ObjectId(ownerId));
            respondSuccess(res, group);
        } catch (err: any) {
            respondFailure(res, err.message);
        }
    };

    public addMember = async (req: any, res: any) => {
        try {
            const {groupId, userId, role} = req.body;
            if (!groupId || !userId || !role) throw new Error("Missing parameters");

            await this.groupRepo.addMember(new ObjectId(groupId), new ObjectId(userId), role);
            respondSuccess(res);
        } catch (err: any) {
            respondFailure(res, err.message);
        }
    };

    public removeMember = async (req: any, res: any) => {
        try {
            const {groupId, userId} = req.body;
            if (!groupId || !userId) throw new Error("Missing parameters");

            await this.groupRepo.removeMember(new ObjectId(groupId), new ObjectId(userId));
            respondSuccess(res);
        } catch (err: any) {
            respondFailure(res, err.message);
        }
    }
}