import {ObjectId} from "mongodb";
import {ProjectRepository} from "./project.repository";
import {respondFailure, respondSuccess} from "../utils/response";
import {Request, Response} from "express";
import path from "path";


export class ProjectController {
    constructor(private projectRepo: ProjectRepository) {}

    public getProjectsForGroup = async (req: any, res: any) => {
        try {
            const groupId = req.query.groupId;
            if (!groupId || !ObjectId.isValid(groupId)) throw new Error("Invalid group ID");

            const projects = await this.projectRepo.getProjectsForGroup(new ObjectId(groupId));
            respondSuccess(res, projects);
        } catch (err: any) {
            respondFailure(res, err.message);
        }
    };

    public createProject = async (req: any, res: any) => {
        try {
            const {name, groupId} = req.body;
            if (!name || !groupId) throw new Error("Name and groupId are required");

            const project = await this.projectRepo.createProject(name, new ObjectId(groupId));
            respondSuccess(res, project);
        } catch (err: any) {
            respondFailure(res, err.message);
        }
    };

    public deleteProject = async (req: any, res: any) => {
        try {
            const {id} = req.body;
            if (!id || !ObjectId.isValid(id)) throw new Error("Invalid project ID");

            await this.projectRepo.deleteProject(new ObjectId(id));
            respondSuccess(res);
        } catch (err: any) {
            respondFailure(res, err.message);
        }
    };

    public accessProject = async (req: Request, res: Response) => {
        const projectId = req.params.id;
        const user = req.user;

        if (!user || !ObjectId.isValid(projectId)) return this.handleProjectAccessFailure(req, res);

        const hasAccess = await this.projectRepo.userHasAccessToProject(user._id, new ObjectId(projectId));
        if (!hasAccess) return this.handleProjectAccessFailure(req, res);

        const project = await this.projectRepo.getProject(new ObjectId(projectId));
        if (!project) return this.handleProjectAccessFailure(req, res);
        res.json(project);
    };

    private handleProjectAccessFailure(req: Request, res: Response) {
        const acceptsHTML = req.headers.accept?.includes("text/html");
        if (acceptsHTML) return res.sendFile(path.join(process.env.FRONTEND_PUBLIC_PATH!, "index.html"));
        return res.status(403).json({ error: "Access denied or project not found" });
    }

}