import {Router} from "express";
import {ProjectController} from "./project.controller";

export function projectApiRoutes(controller: ProjectController): Router {
    const router = Router();

    router.get("/", controller.getProjectsForGroup);

    router.get("/:id", controller.accessProject);
    router.delete("/:id", controller.deleteProject);
    router.post("/", controller.createProject);

    return router;
}