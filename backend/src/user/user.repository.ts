import {Collection, ObjectId} from "mongodb";
import {User} from "./user";
import {AppRepositories} from "../app/app.repositories";

export class UserRepository {
    public constructor(
        private collection: Collection<User>,
        private repos: AppRepositories
    ) {}

    public async findByEmail(email: string): Promise<User | null> {
        return this.collection.findOne({email});
    }

    public async findById(id: ObjectId): Promise<User | null> {
        return this.collection.findOne({_id: id});
    }

    public async createUser(email: string, name?: string): Promise<User> {
        const user = new User(new ObjectId(), email, name);
        await this.collection.insertOne(user);
        await this.repos.groupRepository.createGroup("My Projects", user._id);
        return user;
    }
}