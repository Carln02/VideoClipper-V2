import {Router} from "express";
import {GroupController} from "./group.controller";

export function groupRoutes(controller: GroupController): Router {
    const router = Router();

    router.get("/", controller.getGroupsForUser);
    router.post("/", controller.createGroup);
    router.post("/add-member", controller.addMember);
    router.post("/remove-member", controller.removeMember);

    return router;
}