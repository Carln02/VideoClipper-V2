import {Router} from "express";
import {MediaController} from "./media.controller";
import {MulterUtil} from "../utils/multerUtil";

export function mediaRoutes(controller: MediaController, multerUtil: MulterUtil): Router {
    const router = Router();

    router.get("/:id", controller.getMedia);
    router.post("/:id", multerUtil.upload.single("media"), controller.uploadMedia);

    return router;
}
