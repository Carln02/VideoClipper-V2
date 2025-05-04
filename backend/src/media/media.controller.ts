import {Router, Request, Response} from "express";
import {MediaService} from "./media.service";
import {MulterConfig} from "../config/config.multer";

export class MediaController {
    public router: Router;
    private readonly mediaService: MediaService;

    public constructor(private mediaStoragePath: string, private readonly multerConfig: MulterConfig) {
        this.router = Router();
        this.mediaService = new MediaService(this.mediaStoragePath);
        this.initRoutes();
    }

    private initRoutes() {
        this.router.get("/media/:id", this.getMedia.bind(this));
        this.router.post("/media/:id", this.multerConfig.upload.single("media"), this.uploadMedia.bind(this));
    }

    private async getMedia(req: Request, res: Response) {
        try {
            const fileInfo = await this.mediaService.getFileInfo(req.params.id);
            res.setHeader("Content-Type", fileInfo.contentType);
            res.setHeader("Content-Length", fileInfo.size.toString());
            this.mediaService.createReadStream(fileInfo.filePath).pipe(res);
        } catch (err: any) {
            console.error(`Error retrieving media: ${err.message}`);
            if (err.message === "File not found") res.status(404).json({error: "Media not found"});
            else res.status(500).json({error: "Internal server error"});
        }
    }

    private async uploadMedia(req: Request, res: Response) {
        try {
            if (!req.file) return res.status(400).json({error: "No file uploaded"});
            res.status(201).json({
                message: "Media uploaded successfully",
                id: req.params.id,
                filename: req.file.filename
            });
        } catch (err: any) {
            console.error(`Error uploading media: ${err.message}`);
            res.status(500).json({error: "Internal server error"});
        }
    }
}
