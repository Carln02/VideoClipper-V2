import {Router} from "express";
import {ProjectController} from "./project.controller";

export function projectApiRoutes(controller: ProjectController): Router {
    const router = Router();

    router.get("/", controller.getProjectsForGroup);
    router.post("/", controller.createProject);
    router.delete("/", controller.deleteProject);

    return router;
}

export function projectRoutes(controller: ProjectController): Router {
    const router = Router();

    router.get("/:id", controller.accessProject);

    return router;
}