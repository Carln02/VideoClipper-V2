import {Router} from "express";
import {UserController} from "./user.controller";

export function userRoutes(userController: UserController): Router {
    const router = Router();

    router.get("/", userController.getUser);

    return router;
}