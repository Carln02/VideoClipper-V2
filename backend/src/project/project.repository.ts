import {Collection, ObjectId} from "mongodb";
import {Project} from "./project";
import {AppRepositories} from "../app/app.repositories";

export class ProjectRepository {
    public constructor(private collection: Collection<Project>, private repos: AppRepositories) {}

    public async getProjectsForGroup(groupId: ObjectId): Promise<Project[]> {
        return this.collection.find({groupId}).toArray();
    }

    public async getProject(id: ObjectId): Promise<Project | null> {
        return this.collection.findOne({_id: id});
    }

    public async createProject(name: string, groupId: ObjectId): Promise<Project> {
        const project = new Project(new ObjectId(), name, groupId);
        await this.collection.insertOne(project);
        return project;
    }

    public async deleteProject(id: ObjectId): Promise<void> {
        await this.collection.deleteOne({_id: id});
    }

    public async userHasAccessToProject(userId: ObjectId, projectId: ObjectId): Promise<boolean> {
        const project = await this.collection.findOne({ _id: projectId });
        if (!project) return false;
        return await this.repos.groupRepository.userHasAccessToGroup(userId, project.groupId);
    }
}