import {Router} from "express";
import {AuthenticationController} from "./authentication.controller";

export function authenticationRoutes(controller: AuthenticationController): Router {
    const router = Router();

    router.get("/me", controller.getCurrentUser);
    router.post("/google", controller.loginWithGoogle);
    router.post("/logout", controller.logout);

    return router;
}