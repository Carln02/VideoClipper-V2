import {Router} from "express";
import {MediaController} from "./media.controller";
import {MulterUtil} from "../utils/multerUtil";

export function mediaRoutes(controller: MediaController, multerUtil: MulterUtil): Router {
    const router = Router();

    router.post("/convert", multerUtil.upload.single("video"), controller.convertMedia);
    router.get("/:id", controller.getMedia);
    router.post("/:id", multerUtil.upload.single("media"), controller.uploadMedia);

    return router;
}