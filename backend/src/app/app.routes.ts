import {UserController} from "../user/user.controller";
import {GroupController} from "../group/group.controller";
import {ProjectController} from "../project/project.controller";
import {MediaController} from "../media/media.controller";
import {mediaRoutes} from "../media/media.routes";
import {userRoutes} from "../user/user.routes";
import {groupRoutes} from "../group/group.routes";
import {projectApiRoutes} from "../project/project.routes";
import path from "path";
import {App} from "./app";
import {authenticationRoutes} from "../authentication/authentication.routes";
import {AuthenticationController} from "../authentication/authentication.controller";
import {Router} from "express";
import {redirectIfAuthenticated} from "./app.middlewares";

export function appRoutes(app: App): Router {
    const router = Router();

    const authenticationController = new AuthenticationController(app.sessions, app.repositories.userRepository);
    const userController = new UserController(app.repositories.userRepository);
    const groupController = new GroupController(app.repositories.groupRepository);
    const projectController = new ProjectController(app.repositories.projectRepository);
    const mediaController = new MediaController(app.repositories.mediaRepository);

    //API
    router.use("/api/auth", authenticationRoutes(authenticationController));
    router.use("/api/media", mediaRoutes(mediaController, app.multerUtil));
    router.use("/api/users", userRoutes(userController));
    router.use("/api/groups", groupRoutes(groupController));
    router.use("/api/projects", projectApiRoutes(projectController));

    //Login
    router.get("/login", redirectIfAuthenticated(app.sessions), (_req, res) => {
        res.sendFile(path.join(app.FRONTEND_PUBLIC_PATH, "login/login.html"));
    });

    //Project
    router.get("/project/:id", (_req, res) => {
        res.sendFile(path.join(app.FRONTEND_PUBLIC_PATH, "project/project.html"));
    });

    //Home
    router.get("*", (_req, res) => {
        res.sendFile(path.join(app.FRONTEND_PUBLIC_PATH, "app/app.html"));
    });

    return router;
}